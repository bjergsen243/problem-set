import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  readonly password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  readonly firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  readonly lastName: string;
} 