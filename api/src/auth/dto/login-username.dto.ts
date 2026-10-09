import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class LoginUsernameDto {
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.toLowerCase())
  username: string;

  @IsString()
  password: string;
}
