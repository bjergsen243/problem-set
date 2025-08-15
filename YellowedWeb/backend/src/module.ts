import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/model/entities/user.entity';
import { PhotoModule } from 'src/modules/photo/photo.module';
import { UserModule } from 'src/modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { QueueModule } from './modules/queue/queue.module';

export const Modules = [
  TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '123456',
    database: 'fresherk2',
    entities: [UserEntity],
    autoLoadEntities: true,
    synchronize: true,
  }),
  BullModule.forRoot({
    redis: {
      host: '127.0.0.1',
      port: 6379,
    },
  }),
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  UserModule,
  PhotoModule,
  QueueModule,
  AuthModule,
];
