import { Response } from 'express';
import { HttpStatus } from '../constants';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface StandardApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = HttpStatus.OK
  ): Response {
    const payload: StandardApiResponse<T> = {
      success: true,
      ...(message ? { message } : {}),
      data,
    };
    return res.status(statusCode).json(payload);
  }

  public static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, message, HttpStatus.CREATED);
  }

  public static paginated<T>(
    res: Response,
    data: T,
    meta: PaginationMeta,
    message?: string,
    statusCode: number = HttpStatus.OK
  ): Response {
    const payload: StandardApiResponse<T> = {
      success: true,
      ...(message ? { message } : {}),
      data,
      meta,
    };
    return res.status(statusCode).json(payload);
  }
}
