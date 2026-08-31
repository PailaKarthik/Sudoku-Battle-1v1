import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import { SudokuVariant } from '../generated/prisma/browser.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async createFromGoogle(data: {
    googleId: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          googleId: data.googleId,
          email: data.email,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
        },
      });

      await tx.rating.create({
        data: {
          userId: user.id,
          variant: SudokuVariant.TWO_BY_THREE,
          rating: 1000,
          highestRating: 1000,
        },
      });

      return user;
    });
  }
  async linkGoogleAccount(
    userId: string,
    googleId: string,
    displayName?: string,
    avatarUrl?: string,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        ...(displayName && { displayName }),
        ...(avatarUrl && { avatarUrl }),
      },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    if (data.username) {
      const existing = await this.prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: userId },
        },
      });

      if (existing) {
        throw new ConflictException('Username is already taken');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.username !== undefined && {
          username: data.username,
        }),

        ...(data.displayName !== undefined && {
          displayName: data.displayName,
        }),

        ...(data.avatarUrl !== undefined && {
          avatarUrl: data.avatarUrl,
        }),

        ...(data.username !== undefined &&
          data.displayName !== undefined && {
            profileCompleted: true,
          }),
      },
    });
  }

  async search(query: string) {
    const value = query.trim();

    if (!value) {
      return [];
    }

    return this.prisma.user.findMany({
      where: {
        OR: [
          {
            id: value,
          },
          {
            username: {
              contains: value,
              mode: 'insensitive',
            },
          },
          {
            displayName: {
              contains: value,
              mode: 'insensitive',
            },
          },
        ],
      },

      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },

      orderBy: {
        username: 'asc',
      },

      take: 20,
    });
  }
}
