import type { Request, Response } from 'express';

import { sendSuccess } from '../../common/response';
import * as dashboardRepository from './dashboard.repository';

export async function getDashboard(_req: Request, res: Response): Promise<void> {
  const stats = await dashboardRepository.getDashboardStats();

  sendSuccess(res, stats, 'Dashboard stats fetched successfully');
}
