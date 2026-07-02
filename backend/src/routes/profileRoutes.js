import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from '../validators/profileValidators.js';
import {
  deleteAvatarController,
  updateProfileController,
  uploadAvatarController,
} from '../controllers/profileController.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.use(requireAuth, requireRole('admin'));
router.patch('/', validate(updateProfileSchema), asyncHandler(updateProfileController));
router.post('/avatar', upload.single('avatar'), asyncHandler(uploadAvatarController));
router.delete('/avatar', asyncHandler(deleteAvatarController));

export default router;
