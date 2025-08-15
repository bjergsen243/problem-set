import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UserDeletedEvent } from '../impl/user-deleted.event';

@EventsHandler(UserDeletedEvent)
export class UserDeletedHandler implements IEventHandler<UserDeletedEvent> {
  private readonly logger = new Logger(UserDeletedHandler.name);

  async handle(event: UserDeletedEvent) {
    this.logger.log(`User deleted: ${event.userId}`);
    // Add additional logic here (e.g., cleanup related data, notify other services)
  }
} 