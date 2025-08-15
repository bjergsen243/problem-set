import { GetUserByIdHandler } from './get-user-by-id.handler';
import { GetUserByEmailHandler } from './get-user-by-email.handler';
import { GetAllUsersHandler } from './get-all-users.handler';

export const UserQueryHandlers = [
  GetUserByIdHandler,
  GetUserByEmailHandler,
  GetAllUsersHandler,
]; 