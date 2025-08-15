import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/services/user.service';
import { SignInDto } from './dtos/sign-in.dto';
import { RefreshTokenService } from './services/refresh-token.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { InvalidCredentialsException, InvalidTokenException, RefreshTokenExpiredException } from './exceptions/auth.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  private async validateCredentials(email: string, password: string) {
    const user = await this.userService.findOne({ email });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.validateCredentials(email, password);
    
    if (!user) {
      throw new InvalidCredentialsException();
    }

    return this.generateAuthTokens(user);
  }

  private async generateAuthTokens(user: any) {
    const payload = { sub: user._id.toString(), email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.createRefreshToken(user._id.toString());

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user,
    };
  }

  async verifyAccessToken(token: string) {
    try {
      return await this.jwtService.verify(token);
    } catch (error) {
      throw new InvalidTokenException();
    }
  }

  async refreshToken(token: string) {
    const refreshToken = await this.refreshTokenService.validateRefreshToken(token);
    if (!refreshToken) {
      throw new RefreshTokenExpiredException();
    }

    const user = await this.userService.findById(refreshToken.userId.toString());
    if (!user) {
      throw new InvalidTokenException('User not found for this token');
    }

    const { password: _, ...userData } = user.toObject();
    const newTokens = await this.generateAuthTokens(userData);
    await this.refreshTokenService.rotateRefreshToken(refreshToken);

    return newTokens;
  }

  async logout(token: string): Promise<void> {
    const refreshToken = await this.refreshTokenService.validateRefreshToken(token);
    if (refreshToken) {
      await this.refreshTokenService.revokeRefreshToken(refreshToken);
    }
  }
}
