import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthPayloadDto {
  uid: string;
  email: string;
}

@Exclude()
export class SignInDto {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: String,
    example: 'thanhsondeptrai243@gmail.com',
    description: 'User email',
  })
  email: string;

  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'password',
    description: 'User password',
  })
  password: string;
}

export class TokenResponseDto {
  @ApiProperty({
    type: String,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJFZmF1YVVsb3VDRDk0eCIsImVtYWlsIjoidGhhbmhzb25kZXB0cmFpMjQzQGdtYWlsLmNvbSIsImlhdCI6MTcxNzQwNDQ4OCwiZXhwIjoxNzE3NDkwODg4fQ.n_EZkYAK5Ou1hHLDXZktrP2uV89R9DXREcO9CwM9rhs',
    description: 'Access Token',
  })
  accessToken: string;

  @ApiProperty({
    type: String,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJFZmF1YVVsb3VDRDk0eCIsImVtYWlsIjoidGhhbmhzb25kZXB0cmFpMjQzQGdtYWlsLmNvbSIsImlhdCI6MTcxNzQwNDQ4OCwiZXhwIjoxNzE5OTk2NDg4fQ.mGEFDhxA_N1mwdzUvapamOBCGvb3uTE9aHy-yfbWHiA',
    description: 'Refresh Token',
  })
  refreshToken: string;
}

export class RefreshTokenRequestDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'Refresh Token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJFZmF1YVVsb3VDRDk0eCIsImVtYWlsIjoidGhhbmhzb25kZXB0cmFpMjQzQGdtYWlsLmNvbSIsImlhdCI6MTcxNzQwNDQ4OCwiZXhwIjoxNzE5OTk2NDg4fQ.mGEFDhxA_N1mwdzUvapamOBCGvb3uTE9aHy-yfbWHiA',
    required: true,
  })
  refreshToken: string;
}

@Exclude()
export class SuccessResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    example: 'Successful',
    description: 'message',
  })
  message: string;
}
