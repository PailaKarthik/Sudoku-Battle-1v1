import { IsEnum } from 'class-validator';

export enum RatingVariantRequest {
  TWO_BY_THREE = '2x3',
  THREE_BY_THREE = '3x3',
}

export class GetRatingDto {
  @IsEnum(RatingVariantRequest)
  variant!: RatingVariantRequest;
}
