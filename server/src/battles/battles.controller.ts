import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { BattlesService } from './battles.service.js';

import { CreateBattleDto } from './dto/create-battle.dto.js';

import { CreateBattleInviteDto } from './dto/create-battle-invite.dto.js';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

import { toPrismaSudokuVariant } from '../sudoku/sudoku-variant.js';

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  /*
   * ---------------------------------------------------------
   * CREATE BATTLE
   * ---------------------------------------------------------
   */

  @Post()
  createBattle(
    @CurrentUser()
    user: AuthenticatedUser,

    @Body()
    dto: CreateBattleDto,
  ) {
    return this.battlesService.createBattle(
      user.sub,
      toPrismaSudokuVariant(dto.variant),
    );
  }

  @Get('recent')
  getRecentBattles(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.battlesService.getRecentBattles(user.sub);
  }

  /*
   * ---------------------------------------------------------
   * BATTLE INVITES
   *
   * IMPORTANT:
   * Static "invites" routes MUST be declared before
   * @Get(':battleId'), otherwise Nest can interpret
   * "invites" as a battleId.
   * ---------------------------------------------------------
   */

  @Get('invites')
  getIncomingInvites(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.battlesService.getIncomingInvites(user.sub);
  }

  @Post('invites')
  sendInvite(
    @CurrentUser()
    user: AuthenticatedUser,

    @Body()
    dto: CreateBattleInviteDto,
  ) {
    return this.battlesService.sendInvite(
      user.sub,
      dto.receiverId,
      toPrismaSudokuVariant(dto.variant),
    );
  }

  @Post('invites/:inviteId/accept')
  acceptInvite(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param('inviteId')
    inviteId: string,
  ) {
    return this.battlesService.acceptInvite(user.sub, inviteId);
  }

  @Post('invites/:inviteId/decline')
  declineInvite(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param('inviteId')
    inviteId: string,
  ) {
    return this.battlesService.declineInvite(user.sub, inviteId);
  }

  /*
   * ---------------------------------------------------------
   * BATTLE RESULT
   * ---------------------------------------------------------
   */

  @Get(':battleId/result')
  getResult(
    @Param('battleId')
    battleId: string,
  ) {
    return this.battlesService.getResult(battleId);
  }

  /*
   * ---------------------------------------------------------
   * CANCEL BATTLE
   * ---------------------------------------------------------
   */

  @Post(':battleId/cancel')
  cancelBattle(
    @Param('battleId')
    battleId: string,
  ) {
    return this.battlesService.cancelBattle(battleId);
  }

  /*
   * ---------------------------------------------------------
   * GET BATTLE
   *
   * Keep this dynamic route AFTER all static routes.
   * ---------------------------------------------------------
   */

  @Get(':battleId')
  getBattle(
    @Param('battleId')
    battleId: string,
  ) {
    return this.battlesService.getBattle(battleId);
  }
}
