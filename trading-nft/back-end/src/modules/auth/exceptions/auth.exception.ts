import { HttpStatus } from '@nestjs/common';
import { AppException } from '../../../shared/exceptions/app.exception';

export class InvalidCredentialsException extends AppException {
  constructor(message = 'Invalid email or password') {
    super(message, HttpStatus.UNAUTHORIZED, 'AUTH_INVALID_CREDENTIALS');
  }
}

export class AccountLockedException extends AppException {
  constructor(message = 'Account is temporarily locked due to too many failed attempts') {
    super(message, HttpStatus.TOO_MANY_REQUESTS, 'AUTH_ACCOUNT_LOCKED');
  }
}

export class InvalidTokenException extends AppException {
  constructor(message = 'Invalid or expired token') {
    super(message, HttpStatus.UNAUTHORIZED, 'AUTH_INVALID_TOKEN');
  }
}

export class RefreshTokenExpiredException extends AppException {
  constructor(message = 'Refresh token has expired') {
    super(message, HttpStatus.UNAUTHORIZED, 'AUTH_REFRESH_TOKEN_EXPIRED');
  }
} 