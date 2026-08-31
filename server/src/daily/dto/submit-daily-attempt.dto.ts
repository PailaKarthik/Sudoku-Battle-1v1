import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class SubmitDailyAttemptDto {
  @IsInt()
  @Min(1)
  @Max(60 * 60 * 1000)
  completionTimeMs!: number;

  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  board!: number[][];
}
