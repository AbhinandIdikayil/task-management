import type { RequestHandler } from 'express';

/**
 * Tiny request logger so local development shows method, path, status and latency.
 */
export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });

  next();
};
