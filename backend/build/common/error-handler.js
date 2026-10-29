"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const env_1 = require("../config/env");
const errors_1 = require("./errors");
const response_1 = require("./response");
const validation_1 = require("./validation");
function isMongoDuplicateKeyError(error) {
    return typeof error === 'object' && error !== null && error.code === 11000;
}
function isBodyParserError(error) {
    return (error instanceof SyntaxError ||
        (typeof error === 'object' && error !== null && typeof error.type === 'string'));
}
const notFoundHandler = (req, res) => {
    (0, response_1.sendError)(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Single place that translates every thrown error into a stable JSON response.
 * Must be registered last, after all routes.
 */
const errorHandler = (error, _req, res, _next) => {
    var _a, _b, _c;
    let statusCode = 500;
    let message = 'Internal server error';
    let details;
    if (error instanceof errors_1.AppError) {
        statusCode = error.statusCode;
        message = error.message;
        details = error.details;
    }
    else if (error instanceof zod_1.ZodError) {
        statusCode = 400;
        message = 'Validation failed';
        details = (0, validation_1.formatZodIssues)(error);
    }
    else if (error instanceof mongoose_1.default.Error.CastError) {
        statusCode = 400;
        message = `Invalid value for "${error.path}"`;
        details = [{ field: error.path, message: error.message }];
    }
    else if (error instanceof mongoose_1.default.Error.ValidationError) {
        statusCode = 400;
        message = 'Validation failed';
        details = Object.values(error.errors).map((issue) => ({
            field: issue.path,
            message: issue.message,
        }));
    }
    else if (error instanceof mongoose_1.default.Error.DocumentNotFoundError) {
        statusCode = 404;
        message = 'Resource not found';
    }
    else if (isMongoDuplicateKeyError(error)) {
        statusCode = 409;
        const fields = Object.keys((_a = error.keyValue) !== null && _a !== void 0 ? _a : {});
        message = fields.length > 0 ? `Duplicate value for: ${fields.join(', ')}` : 'Duplicate value';
    }
    else if (isBodyParserError(error)) {
        statusCode = (_c = (_b = error.status) !== null && _b !== void 0 ? _b : error.statusCode) !== null && _c !== void 0 ? _c : 400;
        message = statusCode === 413 ? 'Request payload is too large' : 'Invalid JSON payload';
    }
    else {
        if (env_1.env.NODE_ENV !== 'production' && error instanceof Error) {
            message = error.message;
        }
        console.error('[unhandled error]', error);
    }
    (0, response_1.sendError)(res, statusCode, message, details);
};
exports.errorHandler = errorHandler;
