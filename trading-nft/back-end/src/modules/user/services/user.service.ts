import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { User, UserDocument } from '../../../schemas/user.schema';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    return this.userRepository.create(createUserDto);
  }

  async findOne(filter: any): Promise<UserDocument | null> {
    return this.userRepository.findOne(filter);
  }

  async findAll(query: any = {}) {
    return this.userRepository.findAll(query);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
    return this.userRepository.findByIdAndUpdate(id, updateUserDto);
  }

  async delete(id: string): Promise<UserDocument | null> {
    return this.userRepository.findByIdAndDelete(id);
  }
}
