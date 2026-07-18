/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { Role } from './enums/user-role.enum';
import { UserRows } from './schema/user.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('create', () => {
    it('should create a user and return it', async () => {
      const createUserDto = {
        fullName: 'test user',
        email: 'test@example.com',
        passwordHash: 'Password123!',
      };
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'create').mockResolvedValue({
        id: 'user 1',
        fullName: 'test user',
        email: 'test@example.com',
        passwordHash: 'Password123!',
        role: Role.User,
      } as UserRows);
      const result = await userService.create(createUserDto);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        id: 'user 1',
        fullName: 'test user',
        email: 'test@example.com',
        passwordHash: 'Password123!',
        role: Role.User,
      });
    });

    it('should throw ConflictExpiation if email already taken', async () => {
      const createUserDto = {
        fullName: 'test user',
        email: 'test@example.com',
        passwordHash: 'Password123!',
      };
      jest
        .spyOn(userRepository, 'findByEmail')
        .mockResolvedValue({ id: 'user 1' } as UserRows);
      await expect(userService.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('should return user if exist', async () => {
      jest
        .spyOn(userRepository, 'findById')
        .mockResolvedValue({ id: 'user 1', fullName: 'test user' } as UserRows);
      const result = await userService.findById('user 1');
      expect(result).toEqual({
        id: 'user 1',
        fullName: 'test user',
      });
    });

    it('should throw NotFoundExpiation if user not found', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(undefined);
      await expect(userService.findById('not exist user id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user if exist', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue({
        id: 'user 1',
        fullName: 'test user',
        email: 'test@example.com',
      } as UserRows);
      const result = await userService.findByEmail('test@example.com');
      expect(result).toEqual({
        id: 'user 1',
        fullName: 'test user',
        email: 'test@example.com',
      });
    });
  });
});
