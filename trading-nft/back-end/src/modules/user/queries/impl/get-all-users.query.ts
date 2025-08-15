export interface PaginationOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export class GetAllUsersQuery {
  constructor(public readonly options?: PaginationOptions) {}
} 