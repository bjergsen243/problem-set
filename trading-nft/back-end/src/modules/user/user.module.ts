import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user.schema';
import { UserCommandHandlers } from './commands/handlers';
import { UserQueryHandlers } from './queries/handlers';
import { UserEventHandlers } from './events/handlers';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { UserSagas } from './sagas/user.sagas';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserRepository,
    UserService,
    ...UserCommandHandlers,
    ...UserQueryHandlers,
    ...UserEventHandlers,
    UserSagas,
  ],
  exports: [UserRepository, UserService],
})
export class UserModule {}
