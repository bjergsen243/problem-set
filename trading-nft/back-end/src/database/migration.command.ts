import { Command, CommandRunner } from 'nest-commander';
import { MigrationService } from './migration-utils/migration.service';

@Command({ name: 'migrate', description: 'Run database migrations' })
export class MigrateCommand extends CommandRunner {
  constructor(private readonly migrationService: MigrationService) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.migrationService.migrate();
      console.log('Migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  }
}

@Command({ name: 'migrate:rollback', description: 'Rollback database migrations' })
export class MigrateRollbackCommand extends CommandRunner {
  constructor(private readonly migrationService: MigrationService) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    try {
      const steps = passedParams.length ? parseInt(passedParams[0], 10) : 1;
      await this.migrationService.rollback(steps);
      console.log('Rollback completed successfully');
    } catch (error) {
      console.error('Rollback failed:', error);
      process.exit(1);
    }
  }
} 