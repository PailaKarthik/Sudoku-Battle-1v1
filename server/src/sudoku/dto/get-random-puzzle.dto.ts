import { IsEnum } from 'class-validator';

export enum SudokuVariantRequest {
  TWO_BY_THREE = '2x3',
  THREE_BY_THREE = '3x3',
}

export class GetRandomPuzzleDto {
  @IsEnum(SudokuVariantRequest)
  variant!: SudokuVariantRequest;
}
