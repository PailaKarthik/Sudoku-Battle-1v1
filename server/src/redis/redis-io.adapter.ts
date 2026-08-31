import { INestApplication } from '@nestjs/common';

import { IoAdapter } from '@nestjs/platform-socket.io';

import { createAdapter } from '@socket.io/redis-adapter';

import { createClient, type RedisClientType } from 'redis';

import type { Server, ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  private pubClient: RedisClientType | null = null;

  private subClient: RedisClientType | null = null;

  constructor(
    app: INestApplication,
    private readonly redisUrl: string,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    this.pubClient = createClient({
      url: this.redisUrl,
    });

    this.subClient = this.pubClient.duplicate();

    this.pubClient.on('error', (error) => {
      console.error('[Redis Socket.IO] Publisher error:', error);
    });

    this.subClient.on('error', (error) => {
      console.error('[Redis Socket.IO] Subscriber error:', error);
    });

    await Promise.all([this.pubClient.connect(), this.subClient.connect()]);

    this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    if (!this.adapterConstructor) {
      throw new Error('Redis Socket.IO adapter has not been initialized');
    }

    const server = super.createIOServer(port, options) as Server;

    server.adapter(this.adapterConstructor);

    return server;
  }

  async closeRedis(): Promise<void> {
    const clients = [this.pubClient, this.subClient];

    await Promise.all(
      clients.map(async (client) => {
        if (client && client.isOpen) {
          await client.quit();
        }
      }),
    );
  }
}
