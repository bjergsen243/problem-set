import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetUserByEmailQuery } from '../impl/get-user-by-email.query';
import { UserRepository } from '../../repositories';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByEmailQuery) {
    const user = await this.userRepository.findByEmail(query.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
} 