import { Router } from 'express';
import dashboardRoutes from './dashboardRoutes.js';
import commandRoutes from './commandRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import profileRoutes from './profileRoutes.js';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/commands', commandRoutes);
router.use('/settings', settingsRoutes);
router.use('/profile', profileRoutes);

export default router;
