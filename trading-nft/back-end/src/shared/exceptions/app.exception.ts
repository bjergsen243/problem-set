import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    code?: string,
    errors?: any[],
  ) {
    super(
      {
        message,
        status,
        code,
        timestamp: new Date().toISOString(),
        errors: errors || [],
      },
      status,
    );
  }
} 