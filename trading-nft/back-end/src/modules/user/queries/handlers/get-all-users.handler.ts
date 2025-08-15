import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllUsersQuery } from '../impl/get-all-users.query';
import { UserRepository } from '../../repositories/user.repository';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetAllUsersQuery) {
    const { options } = query;
    
    const [items, total] = await Promise.all([
      this.userRepository.find({
        skip: options?.skip,
        take: options?.take,
        order: options?.orderBy,
      }),
      this.userRepository.count(),
    ]);

    return {
      items,
      total,
    };
  }
} 