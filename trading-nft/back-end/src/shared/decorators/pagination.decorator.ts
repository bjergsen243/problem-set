import {
  BadRequestException,
  ExecutionContext,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const ApiPaginationQuery = () => {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      description: `Page number, default: ${DEFAULT_PAGE}`,
      type: Number,
    }),

    ApiQuery({
      name: 'limit',
      required: false,
      description: `Number items per page, default: ${DEFAULT_LIMIT}`,
      type: Number,
    }),
  );
};

export const Pagination = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return createPagination(req.query.page, req.query.limit);
  },
);

const createPagination = (
  pageStr: string,
  limitStr: string,
): { page: number; limit: number } => {
  let page: number;
  let limit: number;

  if (pageStr === undefined || pageStr === null) {
    page = DEFAULT_PAGE;
  } else {
    if (!isIntNumberStringReq(pageStr)) {
      throw new BadRequestException('Page and limit must be an integer number');
    }
    page = +pageStr;
  }

  if (limitStr === undefined || limitStr === null) {
    limit = DEFAULT_LIMIT;
  } else {
    if (!isIntNumberStringReq(limitStr)) {
      throw new BadRequestException('Page and limit must be an integer number');
    }
    limit = +limitStr;
  }

  if (page < 0 || limit < 0) {
    throw new BadRequestException('Page and limit must be greater than 0');
  }

  if (page == 0 || limit == 0) {
    throw new BadRequestException('Page and limit must not equal to 0');
  }

  if (limit > 200) {
    throw new BadRequestException('Limit must be less than or equal to 200');
  }

  return {
    page,
    limit,
  };
};

function isIntNumberStringReq(str: string): boolean {
  return new RegExp(/^-?[0-9]+$/).test(str);
}
