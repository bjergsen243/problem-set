import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @ApiProperty({
    type: Number,
    description: 'Page number (1-based)',
    example: 1,
    required: false,
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    type: Number,
    description: 'Number of items per page',
    example: 10,
    required: false,
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    type: String,
    description: 'Field to sort by',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    enum: ['asc', 'desc'],
    description: 'Sort order',
    required: false,
    default: 'desc',
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}

export class ErrorMessageDto {
  @ApiProperty({
    type: Number,
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    type: [String],
    example: ['Error message'],
  })
  message: string | string[];

  @ApiProperty({
    type: String,
    example: 'Bad Request',
  })
  error?: string;
}

export class UnauthorizedResponseDto {
  @ApiProperty({
    type: Number,
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    type: [String],
    example: ['Unauthorized'],
  })
  message: string[];

  @ApiProperty({
    type: String,
    example: 'Unauthorized',
  })
  error: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty({
    type: 'object',
    properties: {
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 10 },
      totalItems: { type: 'number', example: 100 },
      totalPages: { type: 'number', example: 10 },
      hasNextPage: { type: 'boolean', example: true },
      hasPreviousPage: { type: 'boolean', example: false },
    },
  })
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
