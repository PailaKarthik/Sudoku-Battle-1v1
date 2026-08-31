import { Body, Controller, Get, Patch, Query } from '@nestjs/common';

import { UsersService } from './users.service.js';

import { UpdateProfileDto } from './dto/update-profile.dto.js';

import { SearchUsersDto } from './dto/search-users.dto.js';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.usersService.findById(user.sub);
  }

  @Patch('me')
  updateMe(
    @CurrentUser()
    user: AuthenticatedUser,

    @Body()
    dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Get('search')
  search(
    @Query()
    query: SearchUsersDto,
  ) {
    return this.usersService.search(query.query ?? '');
  }
}
