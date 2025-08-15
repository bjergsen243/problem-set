import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IMigration, IMigrationMeta } from './migration.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private async getMigrationCollection() {
    return this.connection.collection('migrations');
  }

  private async getAppliedMigrations(): Promise<IMigrationMeta[]> {
    const collection = await this.getMigrationCollection();
    const results = await collection.find().sort({ timestamp: 1 }).toArray();
    return results.map(doc => ({
      name: doc.name as string,
      timestamp: doc.timestamp as number,
      description: doc.description as string
    }));
  }

  private async markMigrationAsApplied(meta: IMigrationMeta): Promise<void> {
    const collection = await this.getMigrationCollection();
    await collection.insertOne({ ...meta, appliedAt: new Date() });
  }

  private async removeMigrationMark(meta: IMigrationMeta): Promise<void> {
    const collection = await this.getMigrationCollection();
    await collection.deleteOne({ name: meta.name });
  }

  async migrate(): Promise<void> {
    const migrations = this.loadMigrations();
    const appliedMigrations = await this.getAppliedMigrations();

    for (const migration of migrations) {
      if (!appliedMigrations.find(m => m.name === migration.meta.name)) {
        this.logger.log(`Applying migration: ${migration.meta.name}`);
        
        try {
          await migration.instance.up();
          await this.markMigrationAsApplied(migration.meta);
          this.logger.log(`Successfully applied migration: ${migration.meta.name}`);
        } catch (error) {
          this.logger.error(`Failed to apply migration ${migration.meta.name}: ${error.message}`);
          throw error;
        }
      }
    }
  }

  async rollback(steps = 1): Promise<void> {
    const appliedMigrations = await this.getAppliedMigrations();
    const migrationsToRollback = appliedMigrations.slice(-steps);

    for (const migrationMeta of migrationsToRollback.reverse()) {
      const migration = this.loadMigrations().find(m => m.meta.name === migrationMeta.name);
      
      if (migration) {
        this.logger.log(`Rolling back migration: ${migrationMeta.name}`);
        
        try {
          await migration.instance.down();
          await this.removeMigrationMark(migrationMeta);
          this.logger.log(`Successfully rolled back migration: ${migrationMeta.name}`);
        } catch (error) {
          this.logger.error(`Failed to rollback migration ${migrationMeta.name}: ${error.message}`);
          throw error;
        }
      }
    }
  }

  private loadMigrations() {
    const migrationsPath = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.migration.ts') || file.endsWith('.migration.js'));

    return migrationFiles
      .map(file => {
        const migrationModule = require(path.join(migrationsPath, file));
        const MigrationClass = migrationModule.default || migrationModule[Object.keys(migrationModule)[0]];
        const instance = new MigrationClass(this.connection);
        
        const meta: IMigrationMeta = {
          name: file.replace(/\.(ts|js)$/, ''),
          timestamp: parseInt(file.split('_')[0], 10),
          description: instance.description || '',
        };

        return { meta, instance };
      })
      .sort((a, b) => a.meta.timestamp - b.meta.timestamp);
  }
} 