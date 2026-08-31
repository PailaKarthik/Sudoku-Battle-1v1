import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { SudokuVariant } from '../generated/prisma/client.js';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRating(userId: string, variant: SudokuVariant) {
    const rating = await this.prisma.rating.findUnique({
      where: {
        userId_variant: {
          userId,
          variant,
        },
      },
    });

    if (!rating) {
      return this.prisma.rating.create({
        data: {
          userId,
          variant,
        },
      });
    }

    return rating;
  }

  async updateRating(userId: string, variant: SudokuVariant, change: number) {
    const current = await this.getRating(userId, variant);

    const newRating = current.rating + change;

    return this.prisma.rating.update({
      where: {
        id: current.id,
      },

      data: {
        rating: newRating,
        gamesPlayed: {
          increment: 1,
        },

        ...(change > 0 && {
          wins: {
            increment: 1,
          },
        }),

        ...(change < 0 && {
          losses: {
            increment: 1,
          },
        }),

        highestRating:
          newRating > current.highestRating ? newRating : undefined,
      },
    });
  }
}
