import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import * as bcrypt from 'bcrypt';
import * as randomToken from 'rand-token';
import * as moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.validateUser(authLoginDto);
    const payload = {
      userId: user.id,
    };
    const refreshToken = await this.getRefreshToken(user.id);
    return {
      access_token: this.jwtService.sign(payload),
      refreshToken,
    };
  }

  async validateUser(authLoginDto: AuthLoginDto) {
    const { email, password } = authLoginDto;
    const user = await this.userService.findByEmail(email);
    if (user == null) {
      throw new NotFoundException('Not found account');
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new NotFoundException('Wrong password');
    }
    return user;
  }

  async getRefreshToken(id: number): Promise<string> {
    const userDataToUpdate = {
      refreshToken: randomToken.generate(16),
      refreshTokenExp: moment().minutes(30).format('YYYY/MM/DD'),
    };
    return userDataToUpdate.refreshToken;
  }
}
