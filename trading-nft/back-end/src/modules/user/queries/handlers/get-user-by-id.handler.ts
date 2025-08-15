import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetUserByIdQuery } from '../impl/get-user-by-id.query';
import { UserRepository } from '../../repositories';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByIdQuery) {
    const user = await this.userRepository.findById(query.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
} 