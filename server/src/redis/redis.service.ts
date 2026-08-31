import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { createClient, type RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: RedisClientType;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('REDIS_URL');

    if (!url) {
      throw new Error('REDIS_URL is not configured');
    }

    this.client = createClient({
      url,
    });

    this.client.on('error', (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[Redis] Client error:', message);
    });
  }

  async onModuleInit(): Promise<void> {
    if (this.client.isOpen) {
      return;
    }

    await this.client.connect();

    console.log('[Redis] Connected');
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.client.isOpen) {
      return;
    }

    await this.client.quit();
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async setWithExpiry(
    key: string,
    value: string,
    seconds: number,
  ): Promise<void> {
    await this.client.set(key, value, {
      EX: seconds,
    });
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async addToSet(key: string, value: string): Promise<void> {
    await this.client.sAdd(key, value);
  }

  async removeFromSet(key: string, value: string): Promise<void> {
    await this.client.sRem(key, value);
  }

  async getSetMembers(key: string): Promise<string[]> {
    return this.client.sMembers(key);
  }
}
