import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../impl/delete-user.command';
import { UserRepository } from '../../repositories/user.repository';
import { NotFoundException } from '@nestjs/common';
import { UserDeletedEvent } from '../../events/impl/user-deleted.event';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteUserCommand) {
    const { id } = command;

    const user = await this.userRepository.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.eventBus.publish(new UserDeletedEvent(id));

    return user;
  }
} 