import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateSettingsSchema } from '../validators/settingsValidators.js';
import {
  getDiscordInviteController,
  getSettingsController,
  updateSettingsController,
} from '../controllers/settingsController.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));
router.get('/discord-invite', asyncHandler(getDiscordInviteController));
router.get('/', asyncHandler(getSettingsController));
router.put('/', validate(updateSettingsSchema), asyncHandler(updateSettingsController));

export default router;
