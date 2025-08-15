import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UserCreatedEvent } from '../impl/user-created.event';

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedHandler.name);

  async handle(event: UserCreatedEvent) {
    this.logger.log(`User created: ${event.userId} (${event.email})`);
    // Add additional logic here (e.g., send welcome email, notify other services)
  }
} 