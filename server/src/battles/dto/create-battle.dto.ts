import { IsEnum } from 'class-validator';

export enum BattleVariantRequest {
  TWO_BY_THREE = '2x3',
  THREE_BY_THREE = '3x3',
}

export class CreateBattleDto {
  @IsEnum(BattleVariantRequest)
  variant!: BattleVariantRequest;
}
