import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWT_HEADERS, JWT_STRATEGY } from '../auth.constant';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(req: Request & { user: any }) {
    if (req.user) {
      return req.user;
    }

    const token = req.headers[JWT_HEADERS];

    if (!token?.match(/Bearer /)) {
      return null;
    }

    const resp = await this.authService.verifyAccessToken(token);
    if (resp instanceof UnauthorizedException) {
      throw new UnauthorizedException(resp);
    }
    return resp;
  }
}
