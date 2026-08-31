import { IsEnum, IsString, MinLength } from 'class-validator';

export enum BattleInviteVariantRequest {
  TWO_BY_THREE = '2x3',
  THREE_BY_THREE = '3x3',
}

export class CreateBattleInviteDto {
  @IsString()
  @MinLength(1)
  receiverId!: string;

  @IsEnum(BattleInviteVariantRequest)
  variant!: BattleInviteVariantRequest;
}
