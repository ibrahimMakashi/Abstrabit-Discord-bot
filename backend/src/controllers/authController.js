import { StatusCodes } from 'http-status-codes';
import { apiResponse } from '../utils/apiResponse.js';
import { accessCookieOptions, clearCookieOptions, refreshCookieOptions } from '../utils/cookie.js';
import {
  getSessionAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAdminSession,
  registerAdmin,
} from '../services/authService.js';
import { createAuditLog } from '../services/auditService.js';

export const register = async (req, res) => {
  const admin = await registerAdmin(req.validated.body);

  await createAuditLog({
    action: 'admin.register',
    target: admin.email,
    details: { adminId: admin.id },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.status(StatusCodes.CREATED).json(
    apiResponse({
      message: 'Admin registered successfully',
      data: admin,
    }),
  );
};

export const login = async (req, res) => {
  const session = await loginAdmin(req.validated.body);

  res.cookie('accessToken', session.accessToken, accessCookieOptions);
  res.cookie('refreshToken', session.refreshToken, refreshCookieOptions);

  await createAuditLog({
    action: 'admin.login',
    target: session.admin.email,
    actorId: session.admin.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.json(
    apiResponse({
      message: 'Login successful',
      data: session.admin,
    }),
  );
};

export const refresh = async (req, res) => {
  const session = await refreshAdminSession(req.cookies.refreshToken);

  res.cookie('accessToken', session.accessToken, accessCookieOptions);
  res.cookie('refreshToken', session.refreshToken, refreshCookieOptions);

  return res.json(
    apiResponse({
      message: 'Session refreshed',
      data: session.admin,
    }),
  );
};

export const logout = async (req, res) => {
  if (req.user?.id) {
    await logoutAdmin(req.user.id);
  }

  res.clearCookie('accessToken', clearCookieOptions);
  res.clearCookie('refreshToken', clearCookieOptions);

  return res.json(
    apiResponse({
      message: 'Logout successful',
      data: null,
    }),
  );
};

export const me = async (req, res) =>
  res.json(
    apiResponse({
      message: 'Session loaded',
      data: getSessionAdmin(req.user),
    }),
  );
