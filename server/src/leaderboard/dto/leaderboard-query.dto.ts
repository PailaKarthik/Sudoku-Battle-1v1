import { IsEnum, IsOptional, IsInt, Max, Min } from 'class-validator';

export enum LeaderboardVariantRequest {
  TWO_BY_THREE = '2x3',
  THREE_BY_THREE = '3x3',
}

export class LeaderboardQueryDto {
  @IsEnum(LeaderboardVariantRequest)
  variant!: LeaderboardVariantRequest;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
