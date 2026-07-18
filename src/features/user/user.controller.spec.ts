import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Role } from './enums/user-role.enum';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getMyProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('getMyProfile', () => {
    it('should return the user info', async () => {
      jest.spyOn(userService, 'getMyProfile').mockResolvedValue({
        id: 'userid',
        email: 'test@example.com',
        role: Role.User,
        fullName: 'user test',
      });
      const result = await userController.getMyProfile('user 1');
      expect(result).toEqual({
        id: 'userid',
        email: 'test@example.com',
        role: Role.User,
        fullName: 'user test',
      });
    });
  });
});
