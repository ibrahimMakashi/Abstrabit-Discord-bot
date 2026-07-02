import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { Admin } from '../models/Admin.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED);
    }

    const payload = verifyAccessToken(token);
    const admin = await Admin.findById(payload.sub).select('-passwordHash -refreshTokenHash');

    if (!admin || !admin.isActive) {
      throw new AppError('Invalid session', StatusCodes.UNAUTHORIZED);
    }

    req.user = admin;
    next();
  } catch {
    next(new AppError('Authentication required', StatusCodes.UNAUTHORIZED));
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Insufficient permissions', StatusCodes.FORBIDDEN));
  }

  return next();
};
