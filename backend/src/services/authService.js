import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { Admin } from '../models/Admin.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { sanitizeAdmin } from '../utils/adminPresenter.js';

export const registerAdmin = async ({ name, email, password }) => {
  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

  if (existingAdmin) {
    throw new AppError('Admin account already exists', StatusCodes.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
  });

  return sanitizeAdmin(admin);
};

export const loginAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin) {
    throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }

  const accessToken = signAccessToken({ sub: admin.id, role: admin.role });
  const refreshToken = signRefreshToken({ sub: admin.id, role: admin.role });
  admin.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  admin.lastLoginAt = new Date();
  await admin.save();

  return {
    admin: sanitizeAdmin(admin),
    accessToken,
    refreshToken,
  };
};

export const refreshAdminSession = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const admin = await Admin.findById(payload.sub);

  if (!admin || !admin.refreshTokenHash) {
    throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED);
  }

  const isMatch = await bcrypt.compare(refreshToken, admin.refreshTokenHash);

  if (!isMatch) {
    throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED);
  }

  const nextAccessToken = signAccessToken({ sub: admin.id, role: admin.role });
  const nextRefreshToken = signRefreshToken({ sub: admin.id, role: admin.role });

  admin.refreshTokenHash = await bcrypt.hash(nextRefreshToken, 10);
  await admin.save();

  return {
    admin: sanitizeAdmin(admin),
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  };
};

export const logoutAdmin = async (adminId) => {
  await Admin.findByIdAndUpdate(adminId, {
    $set: {
      refreshTokenHash: null,
    },
  });
};

export const getSessionAdmin = (admin) => sanitizeAdmin(admin);
