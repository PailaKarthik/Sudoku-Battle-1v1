import { Injectable } from '@nestjs/common';

import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class BattlePresenceService {
  private readonly keyPrefix = 'presence:user:';

  constructor(private readonly redisService: RedisService) {}

  private getKey(userId: string): string {
    return `${this.keyPrefix}${userId}`;
  }

  async addConnection(userId: string, socketId: string): Promise<void> {
    await this.redisService.addToSet(this.getKey(userId), socketId);
  }

  async removeConnection(userId: string, socketId: string): Promise<void> {
    const key = this.getKey(userId);

    await this.redisService.removeFromSet(key, socketId);

    const remaining = await this.redisService.getSetMembers(key);

    if (remaining.length === 0) {
      await this.redisService.delete(key);
    }
  }

  async isOnline(userId: string): Promise<boolean> {
    const sockets = await this.redisService.getSetMembers(this.getKey(userId));

    return sockets.length > 0;
  }

  async getSocketIds(userId: string): Promise<string[]> {
    return this.redisService.getSetMembers(this.getKey(userId));
  }
}
