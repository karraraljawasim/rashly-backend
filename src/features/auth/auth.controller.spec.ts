/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenPair } from './types/auth.types';

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get(AuthController);
  });
  describe('register', () => {
    it('should return a token pair (access, and refresh tokens)', async () => {
      const result: TokenPair = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
      const dto = {
        fullName: 'test user',
        email: 'test@example.com',
        password: 'Password123$',
      };

      jest.spyOn(authService, 'register').mockResolvedValue(result);

      const response = await authController.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe('login', () => {
    it('should return a token pair on valid credentials', async () => {
      const result: TokenPair = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
      const dto = {
        email: 'test@example.com',
        password: 'Password123$',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(result);

      const response = await authController.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });
});
