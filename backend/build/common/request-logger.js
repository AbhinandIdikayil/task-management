"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
/**
 * Tiny request logger so local development shows method, path, status and latency.
 */
const requestLogger = (req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startedAt;
        console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
};
exports.requestLogger = requestLogger;
