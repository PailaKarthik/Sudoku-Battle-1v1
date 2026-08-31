import { IsString, MinLength } from 'class-validator';

export class CreateFriendRequestDto {
  @IsString()
  @MinLength(1)
  userId!: string;
}
