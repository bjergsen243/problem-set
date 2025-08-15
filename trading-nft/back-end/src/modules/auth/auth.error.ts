import { UnauthorizedException } from '@nestjs/common';

export class RefreshPayloadInvalidError extends UnauthorizedException {
  constructor() {
    super({
      error: 'REFRESH_PAYLOAD_INVALID',
      message: 'Refresh token payload invalid.',
    });
  }
}

export class JwtPayloadInvalidError extends UnauthorizedException {
  constructor() {
    super({
      error: 'JWT_PAYLOAD_INVALID',
      message: 'JWT payload invalid.',
    });
  }
}

export class JwtTokenExpiredError extends UnauthorizedException {
  constructor() {
    super({
      error: 'JWT_TOKEN_EXPIRED',
      message: 'JWT token expired.',
    });
  }
}

export class WrongPasswordError extends UnauthorizedException {
  constructor() {
    super({
      error: 'WRONG_PASSWORD',
      message: 'Wrong password.',
    });
  }
}

export class RefreshTokenExpiredError extends UnauthorizedException {
  constructor() {
    super({
      error: 'REFRESH_TOKEN_EXPIRED',
      message: 'Refresh token expired.',
    });
  }
}
