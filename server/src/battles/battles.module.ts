import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { BattlesController } from './battles.controller.js';
import { BattlesService } from './battles.service.js';
import { BattlesGateway } from './battles.gateway.js';
import { BattlesEvents } from './battles.events.js';
import { BattlePresenceService } from './battle-presence.service.js';
import { BattleStateService } from './battle-state.service.js';
import { MatchmakingService } from './matchmaking.service.js';

@Module({
  imports: [AuthModule],

  controllers: [BattlesController],

  providers: [
    BattlesService,
    BattlesGateway,
    BattlesEvents,
    BattlePresenceService,
    BattleStateService,
    MatchmakingService,
  ],

  exports: [BattlesService, BattlePresenceService, MatchmakingService],
})
export class BattlesModule {}
