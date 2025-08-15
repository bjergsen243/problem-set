import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { User, UserDocument } from '../../../schemas/user.schema';

interface FindOptions {
  skip?: number;
  take?: number;
  order?: Record<string, 'asc' | 'desc'>;
}

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name)
    userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email }).exec();
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.model(data);
    return user.save();
  }

  async findOne(filter: any): Promise<UserDocument | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(query: any = {}): Promise<UserDocument[]> {
    return this.model.find(query).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.model.findById(id).exec();
  }

  async findByIdAndUpdate(id: string, data: Partial<User>): Promise<UserDocument | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async findByIdAndDelete(id: string): Promise<UserDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async find(options?: FindOptions): Promise<UserDocument[]> {
    const query = this.model.find();

    if (options?.skip !== undefined) {
      query.skip(options.skip);
    }

    if (options?.take !== undefined) {
      query.limit(options.take);
    }

    if (options?.order) {
      const [field, direction] = Object.entries(options.order)[0];
      query.sort({ [field]: direction === 'asc' ? 1 : -1 });
    }

    return query.exec();
  }

  async count(): Promise<number> {
    return this.model.countDocuments().exec();
  }
}
