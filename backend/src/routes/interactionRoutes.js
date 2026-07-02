import { Router } from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  interactionHealthController,
  interactionsController,
} from '../controllers/interactionController.js';

const router = Router();

router.get('/', asyncHandler(interactionHealthController));
router.post(
  '/',
  verifyKeyMiddleware(env.DISCORD_PUBLIC_KEY),
  asyncHandler(interactionsController),
);

export default router;
