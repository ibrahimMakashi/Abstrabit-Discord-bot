import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { createAuditLog } from '../services/auditService.js';
import { deleteAvatar, updateProfile, uploadAvatar } from '../services/profileService.js';

export const updateProfileController = async (req, res) => {
  const profile = await updateProfile(req.user.id, req.validated.body);

  await createAuditLog({
    actorId: req.user.id,
    action: 'profile.update',
    target: 'profile',
    details: { name: req.validated.body.name },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.json(
    apiResponse({
      message: 'Profile updated',
      data: profile,
    }),
  );
};

export const uploadAvatarController = async (req, res) => {
  if (!req.file) {
    throw new AppError('Avatar image is required', StatusCodes.BAD_REQUEST);
  }

  try {
    const profile = await uploadAvatar(req.user.id, req.file.buffer, req.file.mimetype);

    await createAuditLog({
      actorId: req.user.id,
      action: 'profile.avatar.upload',
      target: 'profile',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.json(
      apiResponse({
        message: 'Avatar uploaded',
        data: profile,
      }),
    );
  } catch (error) {
    if (error.message === 'Cloudinary is not configured') {
      throw new AppError('Image upload service is not configured', StatusCodes.SERVICE_UNAVAILABLE);
    }

    throw error;
  }
};

export const deleteAvatarController = async (req, res) => {
  const profile = await deleteAvatar(req.user.id);

  await createAuditLog({
    actorId: req.user.id,
    action: 'profile.avatar.delete',
    target: 'profile',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.json(
    apiResponse({
      message: 'Avatar removed',
      data: profile,
    }),
  );
};
