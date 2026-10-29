"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.ValidationError = exports.NotFoundError = exports.BadRequestError = exports.AppError = void 0;
/**
 * Base class for errors that are safe to expose to API clients.
 * Anything that is not an AppError is treated as an unexpected error.
 */
class AppError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.isOperational = true;
        this.name = new.target.name;
        this.statusCode = statusCode;
        if (details) {
            this.details = details;
        }
        Error.captureStackTrace(this, new.target);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = 'Bad request', details) {
        super(400, message, details);
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, message);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(details, message = 'Validation failed') {
        super(400, message, details);
    }
}
exports.ValidationError = ValidationError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(409, message);
    }
}
exports.ConflictError = ConflictError;
