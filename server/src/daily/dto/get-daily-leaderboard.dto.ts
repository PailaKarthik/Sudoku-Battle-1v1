import { IsEnum } from 'class-validator';

export enum DailyLeaderboardScope {
  GLOBAL = 'global',
  FRIENDS = 'friends',
}

export class GetDailyLeaderboardDto {
  @IsEnum(DailyLeaderboardScope)
  scope!: DailyLeaderboardScope;
}
