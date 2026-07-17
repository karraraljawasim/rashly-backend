/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserRows } from '../user/schema/user.schema';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;
  let authRepository: AuthRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            storeRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('signed-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      const dto = {
        fullName: 'test user',
        email: 'test@example.com',
        password: 'Password123!',
      };
      jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue({ id: '123' } as UserRows);

      await expect(authService.register(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create new user and return tokens (access, and refresh)', async () => {
      const dto = {
        fullName: 'test user',
        email: 'test@example.com',
        password: 'Password123!',
      };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(undefined);
      jest
        .spyOn(userService, 'create')
        .mockResolvedValue({ id: 'user 1', role: 'user' } as UserRows);

      jest
        .spyOn(authRepository, 'storeRefreshToken')
        .mockResolvedValue(undefined);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password!');

      const result = await authService.register(dto);
      expect(userService.create).toHaveBeenCalledWith({
        fullName: 'test user',
        email: 'test@example.com',
        passwordHash: 'hashed-password!',
      });

      expect(authRepository.storeRefreshToken).toHaveBeenCalled();

      expect(result).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      });
    });
  });

  describe('login', () => {
    it('should return tokens (access, and refresh) and store refresh token on correct email and password', async () => {
      const loginDto = { email: 'test@example.com', password: 'Password123!' };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed_password!',
      } as UserRows);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginDto);

      expect(authRepository.storeRefreshToken).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      });
    });

    it('should throw UnauthorizedException if email or password incorrect', async () => {
      const loginDto = {
        email: 'NotExistEmail@example.com',
        password: 'Password123!',
      };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(undefined);
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      const loginDto2 = {
        email: 'test@example.com',
        password: 'wrong_password!',
      };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue({
        id: 'user 1',
        passwordHash: 'hashed_password',
      } as UserRows);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDto2)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
