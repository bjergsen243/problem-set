import { SortOrder } from 'mongoose';

export interface IPaginationOptions<T = any> {
  page: number;
  limit: number;
  sort?: {
    [K in keyof T]?: SortOrder;
  } & {
    createdAt?: SortOrder;
  };
  lean?: boolean;
  select?: (keyof T)[] | string;
  populate?: string | string[];
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IPaginatedResult<T> {
  items: T[];
  meta: IPaginationMeta;
}

export interface ITxTrace {
  txHash: string;
  txStatus: number;
  timestamp: number;
}
