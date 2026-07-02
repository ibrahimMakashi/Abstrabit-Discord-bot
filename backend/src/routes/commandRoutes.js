import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { commandQuerySchema } from '../validators/commandValidators.js';
import { getCommandLogsController } from '../controllers/commandController.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));
router.get('/', validate(commandQuerySchema, 'query'), asyncHandler(getCommandLogsController));

export default router;
