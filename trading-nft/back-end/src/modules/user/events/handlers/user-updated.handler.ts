import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UserUpdatedEvent } from '../impl/user-updated.event';

@EventsHandler(UserUpdatedEvent)
export class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent> {
  private readonly logger = new Logger(UserUpdatedHandler.name);

  async handle(event: UserUpdatedEvent) {
    this.logger.log(`User updated: ${event.userId} with changes: ${JSON.stringify(event.updates)}`);
    // Add additional logic here (e.g., notify other services, update cache)
  }
} 