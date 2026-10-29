import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { env } from '../config/env';
import { AppError, type ErrorDetail } from './errors';
import { sendError } from './response';
import { formatZodIssues } from './validation';

interface MongoError {
  code?: number;
  keyValue?: Record<string, unknown>;
}

interface BodyParserError extends Error {
  type?: string;
  status?: number;
  statusCode?: number;
}

function isMongoDuplicateKeyError(error: unknown): error is MongoError {
  return typeof error === 'object' && error !== null && (error as MongoError).code === 11000;
}

function isBodyParserError(error: unknown): error is BodyParserError {
  return (
    error instanceof SyntaxError ||
    (typeof error === 'object' && error !== null && typeof (error as BodyParserError).type === 'string')
  );
}

export const notFoundHandler: RequestHandler = (req, res) => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};

/**
 * Single place that translates every thrown error into a stable JSON response.
 * Must be registered last, after all routes.
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: ErrorDetail[] | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = formatZodIssues(error);
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for "${error.path}"`;
    details = [{ field: error.path, message: error.message }];
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(error.errors).map((issue) => ({
      field: issue.path,
      message: issue.message,
    }));
  } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
    statusCode = 404;
    message = 'Resource not found';
  } else if (isMongoDuplicateKeyError(error)) {
    statusCode = 409;
    const fields = Object.keys(error.keyValue ?? {});
    message = fields.length > 0 ? `Duplicate value for: ${fields.join(', ')}` : 'Duplicate value';
  } else if (isBodyParserError(error)) {
    statusCode = error.status ?? error.statusCode ?? 400;
    message = statusCode === 413 ? 'Request payload is too large' : 'Invalid JSON payload';
  } else {
    if (env.NODE_ENV !== 'production' && error instanceof Error) {
      message = error.message;
    }

    console.error('[unhandled error]', error);
  }

  sendError(res, statusCode, message, details);
};
