import { Controller, Get, Query } from '@nestjs/common';

import { RatingsService } from './ratings.service.js';

import { GetRatingDto } from './dto/get-rating.dto.js';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

import { toPrismaSudokuVariant } from '../sudoku/sudoku-variant.js';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('me')
  getMyRating(
    @CurrentUser()
    user: AuthenticatedUser,

    @Query()
    query: GetRatingDto,
  ) {
    return this.ratingsService.getRating(
      user.sub,
      toPrismaSudokuVariant(query.variant),
    );
  }
}
