import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';
import { randomUUID } from 'crypto';

interface PendingRequest {
  resolve: (value: { success: boolean; message: string }) => void;
  timer: ReturnType<typeof setTimeout>;
}

@Injectable()
export class BridgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BridgeService.name);
  private ws: WebSocket | null = null;
  private authenticated = false;
  private pending = new Map<string, PendingRequest>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;

  private static readonly MAX_RECONNECT_DELAY = 60_000;
  private static readonly BASE_RECONNECT_DELAY = 3_000;

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

  async execute(server: string, command: string, timeoutMs = 10_000): Promise<{ success: boolean; message: string }> {
    if (!this.connected) {
      return { success: false, message: 'Bridge not connected' };
    }

    return new Promise((resolve) => {
      const id = randomUUID();

      const timer = setTimeout(() => {
        this.pending.delete(id);
        resolve({ success: false, message: 'Request timed out' });
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

  private connect() {
    const url = this.configService.get<string>('BRIDGE_URL');

    if (!url) {
      this.logger.warn('BRIDGE_URL not configured, skipping connection');
      return;
    }

    this.logger.log(`Connecting to bridge at ${url}`);

    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      this.reconnectAttempt = 0;
      this.logger.log('Connected to bridge, authenticating...');
      const secret = this.configService.get<string>('BRIDGE_SECRET');
      const authPayload = JSON.stringify({ type: 'auth', secret, role: 'api' });
      this.logger.log(`Sending auth payload (secret masked)`);
      this.ws!.send(authPayload);
    });

    this.ws.on('message', (raw: WebSocket.RawData) => {
      const text = raw.toString();
      this.logger.log(`Bridge message received: ${text}`);
      this.handleMessage(text);
    });

    this.ws.on('close', (code: number, reason: Buffer) => {
      this.logger.warn(`Bridge closed: code=${code}, reason=${reason.toString()}`);
      this.authenticated = false;
      this.scheduleReconnect();
    });

    this.ws.on('error', (err: Error) => {
      this.logger.error(`Bridge error: ${err.message}`);
    });
  }

  private handleMessage(text: string) {
    try {
      const data = JSON.parse(text);

      if (data.type === 'auth' && data.success) {
        this.authenticated = true;
        this.logger.log('Bridge authenticated');
        return;
      }

      if (data.type === 'response') {
        const pending = this.pending.get(data.id);
        if (pending) {
          clearTimeout(pending.timer);
          this.pending.delete(data.id);
          pending.resolve({ success: data.success, message: data.message });
        }
      }
    } catch {
      this.logger.warn('Failed to parse bridge message');
    }
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
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    for (const [, req] of this.pending) {
      clearTimeout(req.timer);
      req.resolve({ success: false, message: 'Bridge shutting down' });
    }
    this.pending.clear();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.authenticated = false;
  }
}
