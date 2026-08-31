import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { WsJwtGuard } from './guards/ws-jwt.guard.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    ConfigModule,
    UsersModule,

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),

        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService, WsJwtGuard],

  exports: [AuthService, JwtModule, WsJwtGuard],
})
export class AuthModule {}
