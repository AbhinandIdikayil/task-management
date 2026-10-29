export interface ErrorDetail {
  field: string;
  message: string;
}

/**
 * Base class for errors that are safe to expose to API clients.
 * Anything that is not an AppError is treated as an unexpected error.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly details?: ErrorDetail[];
  readonly isOperational = true;

  constructor(statusCode: number, message: string, details?: ErrorDetail[]) {
    super(message);

    this.name = new.target.name;
    this.statusCode = statusCode;

    if (details) {
      this.details = details;
    }

    Error.captureStackTrace(this, new.target);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: ErrorDetail[]) {
    super(400, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class ValidationError extends AppError {
  constructor(details: ErrorDetail[], message = 'Validation failed') {
    super(400, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, message);
  }
}
