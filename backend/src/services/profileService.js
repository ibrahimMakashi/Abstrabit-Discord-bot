import { StatusCodes } from 'http-status-codes';
import { Admin } from '../models/Admin.js';
import { AppError } from '../utils/AppError.js';
import { sanitizeAdmin } from '../utils/adminPresenter.js';
import { deleteAvatarImage, uploadAvatarImage } from './cloudinaryService.js';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export const updateProfile = async (adminId, { name }) => {
  const admin = await Admin.findByIdAndUpdate(
    adminId,
    { $set: { name } },
    { new: true, runValidators: true },
  ).select('-passwordHash -refreshTokenHash');

  if (!admin) {
    throw new AppError('Admin not found', StatusCodes.NOT_FOUND);
  }

  return sanitizeAdmin(admin);
};

export const uploadAvatar = async (adminId, buffer, contentType) => {
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new AppError('Invalid image type. Use JPEG, PNG, or WebP.', StatusCodes.BAD_REQUEST);
  }

  if (!buffer?.length || buffer.length > MAX_AVATAR_SIZE) {
    throw new AppError('Image must be 2MB or smaller', StatusCodes.BAD_REQUEST);
  }

  const existingAdmin = await Admin.findById(adminId).select('avatarPublicId');

  if (!existingAdmin) {
    throw new AppError('Admin not found', StatusCodes.NOT_FOUND);
  }

  const uploadResult = await uploadAvatarImage(buffer, adminId);

  if (existingAdmin.avatarPublicId && existingAdmin.avatarPublicId !== uploadResult.public_id) {
    await deleteAvatarImage(existingAdmin.avatarPublicId);
  }

  const admin = await Admin.findByIdAndUpdate(
    adminId,
    {
      $set: {
        avatarUrl: uploadResult.secure_url,
        avatarPublicId: uploadResult.public_id,
      },
    },
    { new: true },
  ).select('-passwordHash -refreshTokenHash');

  return sanitizeAdmin(admin);
};

export const deleteAvatar = async (adminId) => {
  const existingAdmin = await Admin.findById(adminId).select('avatarPublicId');

  if (!existingAdmin) {
    throw new AppError('Admin not found', StatusCodes.NOT_FOUND);
  }

  if (existingAdmin.avatarPublicId) {
    await deleteAvatarImage(existingAdmin.avatarPublicId);
  }

  const admin = await Admin.findByIdAndUpdate(
    adminId,
    {
      $unset: {
        avatarUrl: '',
        avatarPublicId: '',
      },
    },
    { new: true },
  ).select('-passwordHash -refreshTokenHash');

  return sanitizeAdmin(admin);
};
