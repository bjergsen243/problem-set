import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../impl/update-user.command';
import { UserRepository } from '../../repositories/user.repository';
import { NotFoundException } from '@nestjs/common';
import { UserUpdatedEvent } from '../../events/impl/user-updated.event';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateUserCommand) {
    const { id, ...updateData } = command;

    const user = await this.userRepository.findByIdAndUpdate(id, updateData);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.eventBus.publish(new UserUpdatedEvent(id, updateData));

    return user;
  }
} 