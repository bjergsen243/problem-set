import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserController } from '../../src/modules/user/user.controller';
import { CreateUserCommand } from '../../src/modules/user/commands/impl/create-user.command';
import { UpdateUserCommand } from '../../src/modules/user/commands/impl/update-user.command';
import { DeleteUserCommand } from '../../src/modules/user/commands/impl/delete-user.command';
import { GetUserByIdQuery } from '../../src/modules/user/queries/impl/get-user-by-id.query';
import { GetUserByEmailQuery } from '../../src/modules/user/queries/impl/get-user-by-email.query';
import { GetAllUsersQuery } from '../../src/modules/user/queries/impl/get-all-users.query';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../../src/modules/user/dto/create-user.dto';
import { UpdateUserDto } from '../../src/modules/user/dto/update-user.dto';
import { PaginationQueryDto } from '../../src/shared/shared.dto';

describe('UserController', () => {
  let controller: UserController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  const mockUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedResult = { id: '1', ...createUserDto };
      jest.spyOn(commandBus, 'execute').mockResolvedValue(expectedResult);

      const result = await controller.createUser(createUserDto);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateUserCommand),
      );
      expect(result).toBe(expectedResult);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true,
      };

      const expectedResult = { id: userId, ...updateUserDto };
      jest.spyOn(commandBus, 'execute').mockResolvedValue(expectedResult);

      const result = await controller.updateUser(userId, updateUserDto);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(UpdateUserCommand),
      );
      expect(result).toBe(expectedResult);
    });

    it('should throw NotFoundException when user not found', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValue(null);

      await expect(controller.updateUser('non-existent-id', updateUserDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = '1';
      jest.spyOn(commandBus, 'execute').mockResolvedValue(true);

      await controller.deleteUser(userId);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(DeleteUserCommand),
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(commandBus, 'execute').mockResolvedValue(null);

      await expect(controller.deleteUser('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserById', () => {
    it('should get a user by id', async () => {
      const userId = '1';
      const expectedResult = { 
        id: userId, 
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      jest.spyOn(queryBus, 'execute').mockResolvedValue(expectedResult);

      const result = await controller.getUserById(userId);
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetUserByIdQuery),
      );
      expect(result).toBe(expectedResult);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValue(null);

      await expect(controller.getUserById('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserByEmail', () => {
    it('should get a user by email', async () => {
      const email = 'test@example.com';
      const expectedResult = { 
        id: '1', 
        email,
        firstName: 'John',
        lastName: 'Doe',
      };
      jest.spyOn(queryBus, 'execute').mockResolvedValue(expectedResult);

      const result = await controller.getUserByEmail(email);
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetUserByEmailQuery),
      );
      expect(result).toBe(expectedResult);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValue(null);

      await expect(controller.getUserByEmail('nonexistent@example.com'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUsers', () => {
    it('should get all users', async () => {
      const paginationDto: PaginationQueryDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc',
      };

      const expectedResult = {
        items: [
          { 
            id: '1', 
            email: 'test1@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
          { 
            id: '2', 
            email: 'test2@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
          },
        ],
        total: 2,
      };
      jest.spyOn(queryBus, 'execute').mockResolvedValue(expectedResult);

      const result = await controller.getAllUsers(paginationDto);
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetAllUsersQuery),
      );
      expect(result).toEqual({
        items: expectedResult.items,
        meta: {
          page: 1,
          limit: 10,
          totalItems: expectedResult.total,
          totalPages: Math.ceil(expectedResult.total / 10),
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });
}); 