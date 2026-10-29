import type { Response } from 'express';

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: unknown,
): Response<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = { success: true, message, data };

  if (meta !== undefined) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  details?: unknown,
): Response<ApiErrorResponse> {
  const body: ApiErrorResponse = { success: false, message };

  if (details !== undefined) {
    body.details = details;
  }

  return res.status(statusCode).json(body);
}
