import { Body, Controller, Get, Post } from '@nestjs/common';

import { AuthService } from './auth.service.js';

import { Public } from './decorators/public.decorator.js';

import { CurrentUser } from './decorators/current-user.decorator.js';

import type { AuthenticatedUser } from './decorators/current-user.decorator.js';

import { GoogleAuthDto } from './dto/google-auth.dto.js';

import { RefreshTokenDto } from './dto/refresh-token.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('google')
  googleLogin(@Body() dto: GoogleAuthDto) {
    return this.authService.googleLogin(dto.idToken);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  logout(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.authService.logout(user.sub, user.sessionId);
  }

  @Get('me')
  me(
    @CurrentUser()
    user: AuthenticatedUser,
  ) {
    return this.authService.getMe(user.sub);
  }
}
