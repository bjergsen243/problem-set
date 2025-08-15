import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/modules/user/dto/create-user.dto';
import { UpdateUserDto } from '../src/modules/user/dto/update-user.dto';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRepository } from '../src/modules/user/repositories/user.repository';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let repository: UserRepository;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI_TEST'),
          }),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    repository = moduleFixture.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    await repository['model'].deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .then((response) => {
          expect(response.body).toBeDefined();
          expect(response.body.email).toBe(createUserDto.email);
          expect(response.body.firstName).toBe(createUserDto.firstName);
          expect(response.body.lastName).toBe(createUserDto.lastName);
          expect(response.body.password).toBeUndefined();
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ ...createUserDto, email: 'invalid-email' })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ ...createUserDto, password: 'short' })
        .expect(400);
    });
  });

  describe('/users/:id (PUT)', () => {
    let userId: string;
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);
      userId = response.body.id;
    });

    it('should update a user', () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(updateUserDto)
        .expect(200)
        .then((response) => {
          expect(response.body.firstName).toBe(updateUserDto.firstName);
          expect(response.body.lastName).toBe(updateUserDto.lastName);
        });
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .put('/users/non-existent-id')
        .send({ firstName: 'Jane' })
        .expect(404);
    });
  });

  describe('/users/:id (DELETE)', () => {
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        });
      userId = response.body.id;
    });

    it('should delete a user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(204);
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/users/non-existent-id')
        .expect(404);
    });
  });

  describe('/users/:id (GET)', () => {
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        });
      userId = response.body.id;
    });

    it('should get a user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(userId);
          expect(response.body.email).toBe('test@example.com');
        });
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(404);
    });
  });

  describe('/users/email/:email (GET)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        });
    });

    it('should get a user by email', () => {
      return request(app.getHttpServer())
        .get('/users/email/test@example.com')
        .expect(200)
        .then((response) => {
          expect(response.body.email).toBe('test@example.com');
        });
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .get('/users/email/nonexistent@example.com')
        .expect(404);
    });
  });

  describe('/users (GET)', () => {
    beforeEach(async () => {
      // Create multiple users
      await Promise.all([
        request(app.getHttpServer())
          .post('/users')
          .send({
            email: 'test1@example.com',
            password: 'Password123!',
            firstName: 'John',
            lastName: 'Doe',
          }),
        request(app.getHttpServer())
          .post('/users')
          .send({
            email: 'test2@example.com',
            password: 'Password123!',
            firstName: 'Jane',
            lastName: 'Smith',
          }),
      ]);
    });

    it('should get all users with pagination', () => {
      return request(app.getHttpServer())
        .get('/users')
        .query({
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          order: 'desc',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.items).toHaveLength(2);
          expect(response.body.meta).toBeDefined();
          expect(response.body.meta.totalItems).toBe(2);
          expect(response.body.meta.totalPages).toBe(1);
          expect(response.body.meta.page).toBe(1);
          expect(response.body.meta.limit).toBe(10);
          expect(response.body.meta.hasNextPage).toBe(false);
          expect(response.body.meta.hasPreviousPage).toBe(false);
        });
    });

    it('should get users with custom pagination settings', () => {
      return request(app.getHttpServer())
        .get('/users')
        .query({
          page: 1,
          limit: 1,
          sortBy: 'createdAt',
          order: 'desc',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.items).toHaveLength(1);
          expect(response.body.meta.totalPages).toBe(2);
          expect(response.body.meta.hasNextPage).toBe(true);
          expect(response.body.meta.hasPreviousPage).toBe(false);
        });
    });

    it('should handle invalid pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/users')
        .query({
          page: 0,
          limit: -1,
        })
        .expect(400);
    });
  });
}); 