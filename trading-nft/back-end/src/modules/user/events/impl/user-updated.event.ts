export class UserUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly updates: Record<string, any>,
  ) {}
} 