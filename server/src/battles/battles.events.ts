import { Injectable } from '@nestjs/common';

import { OnEvent } from '@nestjs/event-emitter';

import { BattlesGateway } from './battles.gateway.js';

type BattleInviteCreatedEvent = {
  inviteId: string;

  receiverId: string;

  sender: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };

  variant: 'TWO_BY_THREE' | 'THREE_BY_THREE';

  expiresAt: string;
};

type BattleInviteUpdatedEvent = {
  inviteId: string;

  senderId: string;

  status: 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

  battleId?: string;
};

@Injectable()
export class BattlesEvents {
  constructor(private readonly gateway: BattlesGateway) {}

  @OnEvent('battle.invite.created')
  async handleInviteCreated(event: BattleInviteCreatedEvent) {
    await this.gateway.notifyUser(
      event.receiverId,

      'battle.invite.received',

      {
        inviteId: event.inviteId,

        sender: event.sender,

        variant: event.variant,

        expiresAt: event.expiresAt,
      },
    );
  }

  @OnEvent('battle.invite.updated')
  async handleInviteUpdated(event: BattleInviteUpdatedEvent) {
    await this.gateway.notifyUser(
      event.senderId,

      'battle.invite.updated',

      {
        inviteId: event.inviteId,

        status: event.status,

        battleId: event.battleId,
      },
    );
  }
}
