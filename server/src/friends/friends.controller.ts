import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { FriendsService } from './friends.service.js';

import { CreateFriendRequestDto } from './dto/create-friend-request.dto.js';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  getFriends(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.friendsService.getFriends(user.sub);
  }

  @Get('requests')
  getRequests(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.friendsService.getRequests(user.sub);
  }

  @Post('requests')
  sendRequest(
    @CurrentUser()
    user: AuthenticatedUser,

    @Body()
    dto: CreateFriendRequestDto,
  ) {
    return this.friendsService.sendRequest(user.sub, dto.userId);
  }

  @Patch('requests/:requestId/accept')
  acceptRequest(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param('requestId')
    requestId: string,
  ) {
    return this.friendsService.acceptRequest(user.sub, requestId);
  }

  @Patch('requests/:requestId/decline')
  declineRequest(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param('requestId')
    requestId: string,
  ) {
    return this.friendsService.declineRequest(user.sub, requestId);
  }

  @Delete(':friendId')
  removeFriend(
    @CurrentUser()
    user: AuthenticatedUser,

    @Param('friendId')
    friendId: string,
  ) {
    return this.friendsService.removeFriend(user.sub, friendId);
  }
}
