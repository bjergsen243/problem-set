import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { UserController } from '../../src/modules/user/user.controller';
import { UserRepository } from '../../src/modules/user/repositories/user.repository';
import { User, UserSchema } from '../../src/schemas/user.schema';
import { CreateUserHandler } from '../../src/modules/user/commands/handlers/create-user.handler';
import { UpdateUserHandler } from '../../src/modules/user/commands/handlers/update-user.handler';
import { DeleteUserHandler } from '../../src/modules/user/commands/handlers/delete-user.handler';
import { GetUserByIdHandler } from '../../src/modules/user/queries/handlers/get-user-by-id.handler';
import { GetUserByEmailHandler } from '../../src/modules/user/queries/handlers/get-user-by-email.handler';
import { GetAllUsersHandler } from '../../src/modules/user/queries/handlers/get-all-users.handler';
import { CreateUserDto } from '../../src/modules/user/dto/create-user.dto';
import { UpdateUserDto } from '../../src/modules/user/dto/update-user.dto';
import { PaginationQueryDto } from '../../src/shared/shared.dto';
import { NotFoundException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('User Module Integration Tests', () => {
  let module: TestingModule;
  let controller: UserController;
  let repository: UserRepository;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let userModel: Model<User>;

  beforeAll(async () => {
    const mockUserModel = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((dto) => ({
        _id: 'test-id',
        ...dto,
        toObject: () => ({
          id: 'test-id',
          ...dto,
        }),
      })),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      countDocuments: jest.fn().mockResolvedValue(0),
    };

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: 'mongodb://127.0.0.1:27017/meme-server-test?directConnection=true',
          }),
          inject: [ConfigService],
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        CqrsModule,
      ],
      controllers: [UserController],
      providers: [
        UserRepository,
        CreateUserHandler,
        UpdateUserHandler,
        DeleteUserHandler,
        GetUserByIdHandler,
        GetUserByEmailHandler,
        GetAllUsersHandler,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    repository = module.get<UserRepository>(UserRepository);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  }, 10000);

  afterEach(async () => {
    await repository['model'].deleteMany({});
  });

  afterAll(async () => {
    if (module) {
      await module.close();
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 500)); // Allow time for cleanup
    }
  });

  describe('User CRUD Operations', () => {
    let createdUser: any;

    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    beforeEach(async () => {
      createdUser = await controller.createUser(createUserDto);
    });

    it('should create a user', async () => {
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(createUserDto.email);
      expect(createdUser.firstName).toBe(createUserDto.firstName);
      expect(createdUser.lastName).toBe(createUserDto.lastName);
    });

    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const updatedUser = await controller.updateUser(createdUser.id, updateUserDto);

      expect(updatedUser).toBeDefined();
      expect(updatedUser.firstName).toBe(updateUserDto.firstName);
      expect(updatedUser.lastName).toBe(updateUserDto.lastName);
    });

    it('should get a user by id', async () => {
      const foundUser = await controller.getUserById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
    });

    it('should get a user by email', async () => {
      const foundUser = await controller.getUserByEmail(createdUser.email);

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(createdUser.email);
    });

    it('should delete a user', async () => {
      await controller.deleteUser(createdUser.id);

      await expect(controller.getUserById(createdUser.id))
        .rejects.toThrow(NotFoundException);
    });

    it('should get all users with pagination', async () => {
      // Create additional users
      await controller.createUser({
        ...createUserDto,
        email: 'test2@example.com',
      });

      const paginationDto: PaginationQueryDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc',
      };

      const result = await controller.getAllUsers(paginationDto);

      expect(result.items).toHaveLength(2);
      expect(result.meta.totalItems).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should throw NotFoundException when getting non-existent user by id', async () => {
      await expect(controller.getUserById('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when getting non-existent user by email', async () => {
      await expect(controller.getUserByEmail('nonexistent@example.com'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      await expect(controller.updateUser('non-existent-id', updateUserDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when deleting non-existent user', async () => {
      await expect(controller.deleteUser('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createdUser = {
        _id: '1',
        ...createUserDto,
        password: 'hashed_password',
        toObject: () => ({
          id: '1',
          ...createUserDto,
          password: 'hashed_password',
        }),
      };

      (userModel.create as jest.Mock).mockResolvedValue(createdUser);
      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await controller.createUser(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.firstName).toBe(createUserDto.firstName);
      expect(result.lastName).toBe(createUserDto.lastName);
      expect(result.password).toBe('hashed_password');
    });

    it('should throw error when creating user with existing email', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      (userModel.findOne as jest.Mock).mockResolvedValue({ email: createUserDto.email });

      await expect(controller.createUser(createUserDto)).rejects.toThrow();
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const existingUser = {
        _id: '1',
        ...createUserDto,
        password: 'hashed_password',
        toObject: () => ({
          id: '1',
          ...createUserDto,
          password: 'hashed_password',
        }),
      };

      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true,
      };

      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
        toObject: () => ({
          id: '1',
          ...createUserDto,
          ...updateUserDto,
          password: 'hashed_password',
        }),
      };

      (userModel.findById as jest.Mock).mockResolvedValue(existingUser);
      (userModel.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });
      (userModel.findOne as jest.Mock).mockResolvedValue(updatedUser);

      const result = await controller.updateUser('1', updateUserDto);

      expect(result).toBeDefined();
      expect(result.firstName).toBe(updateUserDto.firstName);
      expect(result.lastName).toBe(updateUserDto.lastName);
      expect(result.isActive).toBe(updateUserDto.isActive);
    });

    it('should throw error when updating non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (userModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(controller.updateUser('nonexistentid', updateUserDto)).rejects.toThrow();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = '1';
      (userModel.findById as jest.Mock).mockResolvedValue({ _id: userId });
      (userModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      await controller.deleteUser(userId);

      expect(userModel.deleteOne).toHaveBeenCalledWith({ _id: userId });
    });
  });

  describe('getUserById', () => {
    it('should get a user by id', async () => {
      const userId = '1';
      const user = {
        _id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        toObject: () => ({
          id: userId,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        }),
      };

      (userModel.findById as jest.Mock).mockResolvedValue(user);

      const result = await controller.getUserById(userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.email).toBe(user.email);
      expect(result.firstName).toBe(user.firstName);
      expect(result.lastName).toBe(user.lastName);
    });

    it('should throw error when getting non-existent user', async () => {
      (userModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(controller.getUserById('nonexistentid')).rejects.toThrow();
    });
  });

  describe('getUserByEmail', () => {
    it('should get a user by email', async () => {
      const email = 'test@example.com';
      const user = {
        _id: '1',
        email,
        firstName: 'John',
        lastName: 'Doe',
        toObject: () => ({
          id: '1',
          email,
          firstName: 'John',
          lastName: 'Doe',
        }),
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(user);

      const result = await controller.getUserByEmail(email);

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.firstName).toBe(user.firstName);
      expect(result.lastName).toBe(user.lastName);
    });

    it('should throw error when getting non-existent user', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(controller.getUserByEmail('nonexistent@example.com')).rejects.toThrow();
    });
  });

  describe('getAllUsers', () => {
    it('should get all users', async () => {
      const users = [
        {
          _id: '1',
          email: 'test1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          toObject: () => ({
            id: '1',
            email: 'test1@example.com',
            firstName: 'John',
            lastName: 'Doe',
          }),
        },
        {
          _id: '2',
          email: 'test2@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          toObject: () => ({
            id: '2',
            email: 'test2@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
          }),
        },
      ];

      const paginationDto: PaginationQueryDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc',
      };

      (userModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(users),
      });
      (userModel.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await controller.getAllUsers(paginationDto);

      expect(result).toBeDefined();
      expect(result.items.length).toBe(2);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });
  });
}); 