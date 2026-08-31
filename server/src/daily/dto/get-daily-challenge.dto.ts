import { IsEnum } from 'class-validator';

export enum DailyVariantRequest {
  TWO_BY_THREE = '2x3',
  THREE_BY_THREE = '3x3',
}

export class GetDailyChallengeDto {
  @IsEnum(DailyVariantRequest)
  variant!: DailyVariantRequest;
}
