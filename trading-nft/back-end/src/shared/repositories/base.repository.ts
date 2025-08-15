import {
  Document,
  FilterQuery,
  Model,
  PaginateModel,
  PipelineStage,
  ProjectionType,
  QueryOptions
} from 'mongoose';

export abstract class BaseRepository<T extends Document> {
  protected readonly model: Model<T>;
  public modelPagination: PaginateModel<T>;
  public collectionName: string;

  constructor(model: Model<T>) {
    this.model = model;
    if (model.hasOwnProperty('paginate')) {
      this.modelPagination = model as PaginateModel<T>;
    }
    this.collectionName = model.collection.name;
  }

  async create(doc: Partial<T>): Promise<T> {
    return this.model.create(doc);
  }

  async findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter);
  }

  async findByIdAndUpdate(
    id: string,
    update: Partial<T>,
    options: QueryOptions<T> = { new: true },
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, options);
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }

  async deleteMany(filter: FilterQuery<T> = {}): Promise<boolean> {
    const result = await this.model.deleteMany(filter);
    return result.deletedCount > 0;
  }

  async aggregate(pipeline: PipelineStage[]) {
    return this.model.aggregate(pipeline);
  }
}
