import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../src/modules/user/services/user.service';
import { RefreshTokenService } from '../../src/modules/auth/services/refresh-token.service';
import { SignInDto } from '../../src/modules/auth/dtos/sign-in.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let userService: UserService;
  let refreshTokenService: RefreshTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            createRefreshToken: jest.fn(),
            validateRefreshToken: jest.fn(),
            rotateRefreshToken: jest.fn(),
            revokeRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    userService = module.get<UserService>(UserService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should authenticate user and return tokens', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        _id: '1',
        email: signInDto.email,
        password: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        toObject: () => ({
          _id: '1',
          email: signInDto.email,
          password: 'hashed_password',
          firstName: 'John',
          lastName: 'Doe',
        }),
      };

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          _id: '1',
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(tokens.accessToken);
      jest.spyOn(refreshTokenService, 'createRefreshToken').mockResolvedValue({ token: tokens.refreshToken } as any);

      const result = await service.signIn(signInDto);

      expect(userService.findOne).toHaveBeenCalledWith({ email: signInDto.email });
      expect(result).toEqual(tokens);
    });

    it('should throw InvalidCredentialsException for invalid credentials', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const user = {
        _id: '1',
        email: signInDto.email,
        password: 'hashed_password',
        toObject: () => ({
          _id: '1',
          email: signInDto.email,
          password: 'hashed_password',
        }),
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens', async () => {
      const oldRefreshToken = 'old-refresh-token';
      const userId = '1';

      const refreshTokenDoc = {
        token: oldRefreshToken,
        userId,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const user = {
        _id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        toObject: () => ({
          _id: userId,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        }),
      };

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          _id: userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };

      jest.spyOn(refreshTokenService, 'validateRefreshToken').mockResolvedValue(refreshTokenDoc as any);
      jest.spyOn(userService, 'findById').mockResolvedValue(user as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue(newTokens.accessToken);
      jest.spyOn(refreshTokenService, 'createRefreshToken').mockResolvedValue({ token: newTokens.refreshToken } as any);
      jest.spyOn(refreshTokenService, 'rotateRefreshToken').mockResolvedValue(undefined);

      const result = await service.refreshToken(oldRefreshToken);

      expect(refreshTokenService.validateRefreshToken).toHaveBeenCalledWith(oldRefreshToken);
      expect(userService.findById).toHaveBeenCalledWith(userId.toString());
      expect(refreshTokenService.rotateRefreshToken).toHaveBeenCalledWith(refreshTokenDoc);
      expect(result).toEqual(newTokens);
    });

    it('should throw RefreshTokenExpiredException for invalid refresh token', async () => {
      const oldRefreshToken = 'invalid-refresh-token';

      jest.spyOn(refreshTokenService, 'validateRefreshToken').mockResolvedValue(null);

      await expect(service.refreshToken(oldRefreshToken)).rejects.toThrow('Refresh token has expired');
    });
  });

  describe('logout', () => {
    it('should revoke refresh token', async () => {
      const token = 'refresh-token';
      const refreshTokenDoc = {
        token,
        userId: '1',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      jest.spyOn(refreshTokenService, 'validateRefreshToken').mockResolvedValue(refreshTokenDoc as any);
      jest.spyOn(refreshTokenService, 'revokeRefreshToken').mockResolvedValue(undefined);

      await service.logout(token);

      expect(refreshTokenService.validateRefreshToken).toHaveBeenCalledWith(token);
      expect(refreshTokenService.revokeRefreshToken).toHaveBeenCalledWith(refreshTokenDoc);
    });
  });
});
