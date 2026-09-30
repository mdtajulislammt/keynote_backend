import { PaginationMeta } from './api-response';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationQueryInput {
  page?: string | number;
  limit?: string | number;
}

export const parsePagination = (
  query: PaginationQueryInput,
  defaultLimit: number = 10,
  maxLimit: number = 100
): PaginationParams => {
  let page = typeof query.page === 'string' ? parseInt(query.page, 10) : Number(query.page);
  let limit = typeof query.limit === 'string' ? parseInt(query.limit, 10) : Number(query.limit);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  } else if (limit > maxLimit) {
    limit = maxLimit;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1 && totalPages > 0,
  };
};
