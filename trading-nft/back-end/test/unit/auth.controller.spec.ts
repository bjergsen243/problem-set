import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from '../../src/modules/auth/dtos/sign-in.dto';
import { RefreshTokenDto } from '../../src/modules/auth/dtos/refresh-token.dto';
import { ThrottlerModule } from '@nestjs/throttler';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{
          ttl: 60,
          limit: 10,
        }]),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should sign in a user', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      jest.spyOn(authService, 'signIn').mockResolvedValue(expectedResult);

      const result = await controller.signIn(signInDto);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'old-refresh-token',
      };

      const expectedResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      jest.spyOn(authService, 'refreshToken').mockResolvedValue(expectedResult);

      const result = await controller.refreshToken(refreshTokenDto);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
      expect(result).toBe(expectedResult);
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token',
      };
      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      await controller.logout(refreshTokenDto);
      expect(authService.logout).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
    });
  });
});
