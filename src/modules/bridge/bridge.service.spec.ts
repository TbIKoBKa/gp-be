import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AddressInfo } from 'net';
import { WebSocketServer } from 'ws';
import { BridgeService } from './bridge.service';

type Mode = 'ok' | 'proxy-down' | 'hub-timeout' | 'drop-on-request';

describe('BridgeService', () => {
  const statics = BridgeService as unknown as Record<string, number>;
  const saved = { ...statics };
  let wss: WebSocketServer;
  let service: BridgeService;
  let mode: Mode;
  let connections: number;
  let autoPong: boolean;

  const startHub = () => {
    wss = new WebSocketServer({ port: 0, autoPong });
    wss.on('connection', (ws) => {
      connections++;
      ws.on('message', (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'auth') return ws.send(JSON.stringify({ type: 'auth', success: true }));
        if (msg.type !== 'request') return;
        if (mode === 'drop-on-request') return ws.terminate();
        const reply = {
          ok: { success: true, message: 'OK' },
          'proxy-down': { success: false, message: 'Bridge not connected' },
          'hub-timeout': { success: false, message: 'Request timed out' },
        }[mode];
        ws.send(JSON.stringify({ type: 'response', id: msg.id, ...reply }));
      });
    });
    return new Promise<string>((resolve) =>
      wss.on('listening', () => resolve(`ws://127.0.0.1:${(wss.address() as AddressInfo).port}`)),
    );
  };

  const startService = (url: string) => {
    const config = { get: (key: string) => ({ BRIDGE_URL: url, BRIDGE_SECRET: 's' })[key] };
    service = new BridgeService(config as unknown as ConfigService);
    service.onModuleInit();
  };

  const until = async (cond: () => boolean, ms = 3000) => {
    const deadline = Date.now() + ms;
    while (!cond()) {
      if (Date.now() > deadline) throw new Error('condition not met in time');
      await new Promise((r) => setTimeout(r, 20));
    }
  };

  beforeAll(() => Logger.overrideLogger(false));

  beforeEach(() => {
    statics.HEARTBEAT_INTERVAL = 100;
    statics.BASE_RECONNECT_DELAY = 50;
    statics.CONNECT_WAIT = 2000;
    mode = 'ok';
    connections = 0;
    autoPong = true;
  });

  afterEach(async () => {
    service?.onModuleDestroy();
    for (const client of wss?.clients ?? []) client.terminate();
    await new Promise((r) => wss?.close(r));
    Object.assign(statics, saved);
  });

  it('delivers a command', async () => {
    startService(await startHub());
    await until(() => service.connected);
    await expect(service.execute('grief', 'say hi')).resolves.toEqual({ success: true, message: 'OK', uncertain: false });
  });

  it('drops and replaces a connection that stops answering pings', async () => {
    autoPong = false;
    startService(await startHub());
    await until(() => connections >= 2);
  });

  it('waits for the bridge instead of failing a command sent mid-reconnect', async () => {
    const url = await startHub();
    startService(url);
    const result = service.execute('grief', 'say hi');
    await expect(result).resolves.toMatchObject({ success: true });
  });

  it('a definite refusal is safe to retry', async () => {
    mode = 'proxy-down';
    startService(await startHub());
    await expect(service.execute('grief', 'say hi')).resolves.toMatchObject({ success: false, uncertain: false });
  });

  it('a hub timeout is uncertain', async () => {
    mode = 'hub-timeout';
    startService(await startHub());
    await expect(service.execute('grief', 'say hi')).resolves.toMatchObject({ success: false, uncertain: true });
  });

  it('a connection lost after send fails fast and is uncertain', async () => {
    mode = 'drop-on-request';
    startService(await startHub());
    await until(() => service.connected);
    const started = Date.now();
    await expect(service.execute('grief', 'say hi')).resolves.toMatchObject({
      success: false,
      message: 'Bridge connection lost',
      uncertain: true,
    });
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it('gives up with a retryable result when the bridge never comes up', async () => {
    statics.CONNECT_WAIT = 200;
    const url = await startHub();
    await new Promise((r) => wss.close(r));
    startService(url);
    await expect(service.execute('grief', 'say hi')).resolves.toEqual({
      success: false,
      message: 'Bridge not connected',
      uncertain: false,
    });
  });
});
