import { BaseMigration } from '../migration-utils/base.migration';

export class CreateRefreshTokensIndexesMigration extends BaseMigration {
  description = 'Create indexes for refresh tokens collection';

  async up(): Promise<void> {
    // Create unique index on token
    await this.createIndex('refreshtokens', { token: 1 }, { unique: true });

    // Create index on userId for efficient querying
    await this.createIndex('refreshtokens', { userId: 1 });

    // Create index on expiresAt for cleanup
    await this.createIndex('refreshtokens', { expiresAt: 1 });

    // Create compound index on userId and isRevoked
    await this.createIndex('refreshtokens', { userId: 1, isRevoked: 1 });

    // Create TTL index to automatically remove expired tokens
    await this.createIndex('refreshtokens', { expiresAt: 1 }, { expireAfterSeconds: 0 });
  }

  async down(): Promise<void> {
    // Drop all created indexes
    await this.dropIndex('refreshtokens', 'token_1');
    await this.dropIndex('refreshtokens', 'userId_1');
    await this.dropIndex('refreshtokens', 'expiresAt_1');
    await this.dropIndex('refreshtokens', 'userId_1_isRevoked_1');
  }
} 