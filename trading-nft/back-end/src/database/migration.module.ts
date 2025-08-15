import { Module } from '@nestjs/common';
import { MigrationService } from './migration-utils/migration.service';

@Module({
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {} 