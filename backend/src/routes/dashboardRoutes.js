import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import {
  getAnalyticsController,
  getDashboardController,
  getSystemStatusController,
} from '../controllers/dashboardController.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));
router.get('/summary', asyncHandler(getDashboardController));
router.get('/analytics', asyncHandler(getAnalyticsController));
router.get('/status', asyncHandler(getSystemStatusController));

export default router;
