import { BaseMigration } from '../migration-utils/base.migration';

export class CreateUsersIndexesMigration extends BaseMigration {
  description = 'Create indexes for users collection';

  async up(): Promise<void> {
    // Create unique index on email
    await this.createIndex('users', { email: 1 }, { unique: true });

    // Create compound index on firstName and lastName for efficient searching
    await this.createIndex('users', { firstName: 1, lastName: 1 });

    // Create index on createdAt for sorting
    await this.createIndex('users', { createdAt: -1 });

    // Create index on isActive for filtering
    await this.createIndex('users', { isActive: 1 });
  }

  async down(): Promise<void> {
    // Drop all created indexes
    await this.dropIndex('users', 'email_1');
    await this.dropIndex('users', 'firstName_1_lastName_1');
    await this.dropIndex('users', 'createdAt_-1');
    await this.dropIndex('users', 'isActive_1');
  }
} 