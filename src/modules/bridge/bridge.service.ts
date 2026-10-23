import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';
import { randomUUID } from 'crypto';

export interface BridgeResult {
  success: boolean;
  message: string;
  /**
   * The command left this process but no answer came back (timeout, connection
   * dropped after send). It may or may not have run on the server, so repeating
   * it could grant the purchase twice. False for every definite failure: not
   * sent at all, or an explicit `success: false` from the hub/proxy/backend.
   */
  uncertain: boolean;
}

interface PendingRequest {
  resolve: (value: BridgeResult) => void;
  timer: ReturnType<typeof setTimeout>;
}

// The hub answers with this text when its own 10s timer fires first — same
// ambiguity as our local timeout.
const HUB_TIMEOUT_MESSAGE = 'Request timed out';

@Injectable()
export class BridgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BridgeService.name);
  private ws: WebSocket | null = null;
  private authenticated = false;
  private pending = new Map<string, PendingRequest>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private alive = false;
  private connectWaiters = new Set<() => void>();
  private stopped = false;

  private static readonly MAX_RECONNECT_DELAY = 60_000;
  private static readonly BASE_RECONNECT_DELAY = 3_000;
  // Without pings a silently dropped connection (Railway edge) stays OPEN forever:
  // on 2026-10-23 one sat dead for 15 days and swallowed the first order sent into it.
  private static readonly HEARTBEAT_INTERVAL = 30_000;
  // Long enough for one reconnect (3s backoff + handshake) after a dropped socket.
  private static readonly CONNECT_WAIT = 8_000;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.authenticated;
  }

  async execute(server: string, command: string, timeoutMs = 10_000): Promise<BridgeResult> {
    if (!this.connected && !(await this.waitForConnection(BridgeService.CONNECT_WAIT))) {
      return { success: false, message: 'Bridge not connected', uncertain: false };
    }

    return new Promise((resolve) => {
      const id = randomUUID();

      const timer = setTimeout(() => {
        this.pending.delete(id);
        resolve({ success: false, message: 'Request timed out', uncertain: true });
      }, timeoutMs);

      this.pending.set(id, { resolve, timer });

      this.ws!.send(JSON.stringify({
        type: 'request',
        id,
        server,
        command,
      }));
    });
  }

  private waitForConnection(timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        this.connectWaiters.delete(done);
        resolve(this.connected);
      };
      const timer = setTimeout(done, timeoutMs);
      this.connectWaiters.add(done);
    });
  }

  private connect() {
    const url = this.configService.get<string>('BRIDGE_URL');

    if (!url) {
      this.logger.warn('BRIDGE_URL not configured, skipping connection');
      return;
    }

    this.logger.log(`Connecting to bridge at ${url}`);

    const ws = new WebSocket(url);
    this.ws = ws;

    ws.on('open', () => {
      this.reconnectAttempt = 0;
      this.logger.log('Connected to bridge, authenticating...');
      const secret = this.configService.get<string>('BRIDGE_SECRET');
      const authPayload = JSON.stringify({ type: 'auth', secret, role: 'api' });
      this.logger.log(`Sending auth payload (secret masked)`);
      ws.send(authPayload);
      this.startHeartbeat(ws);
    });

    ws.on('pong', () => {
      this.alive = true;
    });

    ws.on('message', (raw: WebSocket.RawData) => {
      const text = raw.toString();
      this.logger.log(`Bridge message received: ${text}`);
      this.handleMessage(text);
    });

    ws.on('close', (code: number, reason: Buffer) => {
      this.logger.warn(`Bridge closed: code=${code}, reason=${reason.toString()}`);
      this.stopHeartbeat();
      this.authenticated = false;
      // Nothing will answer on this socket any more; fail now instead of waiting out the timer.
      this.failPending('Bridge connection lost');
      if (!this.stopped) this.scheduleReconnect();
    });

    ws.on('error', (err: Error) => {
      this.logger.error(`Bridge error: ${err.message}`);
    });
  }

  private startHeartbeat(ws: WebSocket) {
    this.stopHeartbeat();
    this.alive = true;
    this.heartbeatTimer = setInterval(() => {
      if (!this.alive) {
        this.logger.warn('Bridge did not answer ping, dropping connection');
        ws.terminate();
        return;
      }
      this.alive = false;
      ws.ping();
    }, BridgeService.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleMessage(text: string) {
    try {
      const data = JSON.parse(text);

      if (data.type === 'auth' && data.success) {
        this.authenticated = true;
        this.logger.log('Bridge authenticated');
        for (const done of [...this.connectWaiters]) done();
        return;
      }

      if (data.type === 'response') {
        const pending = this.pending.get(data.id);
        if (pending) {
          clearTimeout(pending.timer);
          this.pending.delete(data.id);
          pending.resolve({
            success: data.success,
            message: data.message,
            uncertain: !data.success && data.message === HUB_TIMEOUT_MESSAGE,
          });
        }
      }
    } catch {
      this.logger.warn('Failed to parse bridge message');
    }
  }

  private failPending(message: string) {
    for (const [, req] of this.pending) {
      clearTimeout(req.timer);
      req.resolve({ success: false, message, uncertain: true });
    }
    this.pending.clear();
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;

    const delay = Math.min(
      BridgeService.BASE_RECONNECT_DELAY * 2 ** this.reconnectAttempt,
      BridgeService.MAX_RECONNECT_DELAY,
    );

    this.reconnectAttempt++;
    this.logger.warn(`Bridge disconnected, reconnecting in ${(delay / 1000).toFixed(0)}s (attempt ${this.reconnectAttempt})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private disconnect() {
    this.stopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();

    this.failPending('Bridge shutting down');
    for (const done of [...this.connectWaiters]) done();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.authenticated = false;
  }
}
