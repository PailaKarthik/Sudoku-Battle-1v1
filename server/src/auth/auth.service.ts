import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

import { createHash } from 'node:crypto';

import { UsersService } from '../users/users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SudokuVariant } from '../generated/prisma/browser.js';

type AccessPayload = {
  sub: string;
  email: string;
};

type RefreshPayload = {
  sub: string;
  sessionId: string;
};

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async googleLogin(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    let user = await this.usersService.findByGoogleId(payload.sub);

    if (!user) {
      user = await this.usersService.findByEmail(payload.email);

      if (user) {
        user = await this.usersService.linkGoogleAccount(
          user.id,
          payload.sub,
          payload.name,
          payload.picture,
        );
      } else {
        user = await this.usersService.createFromGoogle({
          googleId: payload.sub,
          email: payload.email,
          displayName: payload.name,
          avatarUrl: payload.picture,
        });
      }
    }

    return this.createSession(user.id, user.email);
  }

  async refreshToken(refreshToken: string) {
    let payload: RefreshPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(
        refreshToken,
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const session = await this.prisma.authSession.findUnique({
      where: {
        id: payload.sessionId,
      },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh session is invalid');
    }

    const tokenHash = this.hashToken(refreshToken);

    if (session.refreshTokenHash !== tokenHash) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    await this.prisma.authSession.update({
      where: {
        id: session.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const user = await this.usersService.findById(session.userId);

    return this.createSession(user.id, user.email);
  }

  async logout(userId: string, sessionId: string) {
    await this.prisma.authSession.updateMany({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);

    const rating = await this.prisma.rating.findUnique({
      where: {
        userId_variant: {
          userId,
          variant: SudokuVariant.TWO_BY_THREE,
        },
      },

      select: {
        rating: true,
        gamesPlayed: true,
        wins: true,
        losses: true,
        draws: true,
        highestRating: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      profileCompleted: user.profileCompleted,

      rating: rating
        ? {
            rating: rating.rating,
            gamesPlayed: rating.gamesPlayed,
            wins: rating.wins,
            losses: rating.losses,
            draws: rating.draws,
            highestRating: rating.highestRating,
          }
        : {
            rating: 1000,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            highestRating: 1000,
          },
    };
  }

  private async createSession(userId: string, email: string) {
    const session = await this.prisma.authSession.create({
      data: {
        userId,
        refreshTokenHash: 'temporary',
        expiresAt: this.getRefreshExpiry(),
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: userId,
      email,
      sessionId: session.id,
    });

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        sessionId: session.id,
      },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      },
    );

    await this.prisma.authSession.update({
      where: {
        id: session.id,
      },
      data: {
        refreshTokenHash: this.hashToken(refreshToken),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: await this.getMe(userId),
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshExpiry() {
    const expiry = new Date();

    expiry.setDate(expiry.getDate() + 30);

    return expiry;
  }
}
