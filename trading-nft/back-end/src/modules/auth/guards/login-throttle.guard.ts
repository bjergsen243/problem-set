import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { AccountLockedException } from '../exceptions/auth.exception';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = 'Too many failed login attempts. Please try again in 5 minutes.';
  
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return `login_${req.body.email}`;
  }

  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    throw new AccountLockedException();
  }

  protected getRequestResponse(context: ExecutionContext) {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    return { req, res };
  }
} 