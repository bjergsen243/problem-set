import { Connection } from 'mongoose';
import { IMigration } from './migration.interface';

export abstract class BaseMigration implements IMigration {
  description: string = '';

  constructor(protected readonly connection: Connection) {}

  abstract up(): Promise<void>;
  abstract down(): Promise<void>;

  protected getCollection(name: string) {
    return this.connection.collection(name);
  }

  protected async createIndex(collectionName: string, index: any, options?: any) {
    const collection = this.getCollection(collectionName);
    await collection.createIndex(index, options);
  }

  protected async dropIndex(collectionName: string, indexName: string) {
    const collection = this.getCollection(collectionName);
    await collection.dropIndex(indexName);
  }

  protected async updateMany(collectionName: string, filter: any, update: any) {
    const collection = this.getCollection(collectionName);
    await collection.updateMany(filter, update);
  }

  protected async deleteMany(collectionName: string, filter: any) {
    const collection = this.getCollection(collectionName);
    await collection.deleteMany(filter);
  }
} 