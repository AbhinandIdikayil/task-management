import { Router } from 'express';

import * as dashboardController from './dashboard.controller';

const dashboardRouter = Router();

dashboardRouter.get('/', dashboardController.getDashboard);

export default dashboardRouter;
