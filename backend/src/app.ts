import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { errorHandler, notFoundHandler } from './common/error-handler';
import { requestLogger } from './common/request-logger';
import { env } from './config/env';
import dashboardRouter from './modules/dashboard/dashboard.route';
import taskRouter from './modules/task/task.route';

function getCorsOrigin(): boolean | string[] {
  if (env.CORS_ORIGIN === '*') {
    return true;
  }

  return env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: getCorsOrigin() }));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  if (!env.isTest) {
    app.use(requestLogger);
  }

  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Task Manager API',
      data: {
        version: '1.0.0',
        endpoints: {
          health: 'GET /health',
          tasks: 'GET | POST /api/tasks',
          task: 'GET | PATCH | DELETE /api/tasks/:id',
          dashboard: 'GET /api/dashboard',
        },
      },
    });
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Service healthy',
      data: {
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use('/api/tasks', taskRouter);
  app.use('/api/dashboard', dashboardRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
