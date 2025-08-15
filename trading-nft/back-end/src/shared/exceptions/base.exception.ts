import { HttpException } from '@nestjs/common';
export class BaseException extends HttpException {
  constructor(
    message: string,
    httpStatus: number,
    private readonly data?: any,
  ) {
    super(message, httpStatus);
  }

  getResponse(): string | object {
    const message = super.getResponse();
    return {
      statusCode: this.getStatus(),
      message: [message],
      error: message,
      ...(this.data && { data: this.data }),
    };
  }
}
