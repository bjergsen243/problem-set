import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { IsEmailAvailable, IsUsernameAvailable } from '../decorators';

@Exclude()
export class UpdateUsernameRequestDto {
  @Expose()
  @ApiProperty({
    type: String,
    example: 'username_123',
    description: 'username',
  })
  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'Username should longer than 3 characters',
  })
  @MaxLength(20, {
    message: 'Username should shorter than 20 characters',
  })
  @IsNotEmpty()
  @IsUsernameAvailable()
  username: string;
}

@Exclude()
export class UpdateEmailRequestDto {
  @Expose()
  @ApiProperty({
    type: String,
    example: 'test@gmail.com',
    description: 'email',
    required: false,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsEmail()
  @IsEmailAvailable()
  email: string;
}

@Exclude()
export class ConfirmEmailRequestDto {
  @Expose()
  @ApiProperty({
    type: String,
    example: 'code',
    description: 'code',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @Expose()
  @ApiProperty({
    type: String,
    example: 'email',
    description: 'email',
    required: true,
  })
  @IsEmail()
  @IsEmailAvailable()
  email: string;
}
