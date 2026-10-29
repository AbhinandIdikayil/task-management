import type { Request, Response } from 'express';

import { createApp } from '../src/app';
import { connectDB } from '../src/config/db';

const app = createApp();
let databaseConnection: Promise<void> | undefined;

export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    databaseConnection ??= connectDB();
    await databaseConnection;

    app(req, res);
  } catch (error) {
    databaseConnection = undefined;
    console.error('Database connection failed:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
      });
    }
  }
}
