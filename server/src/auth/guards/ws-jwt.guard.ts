import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { WsException } from '@nestjs/websockets';

import type { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const data = client.data as { user?: unknown } | undefined;

    if (!data?.user) {
      throw new WsException('WebSocket authentication required');
    }

    return true;
  }
}
