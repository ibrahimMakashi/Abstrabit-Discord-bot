import { AuditLog } from '../models/AuditLog.js';

export const createAuditLog = async (payload) => AuditLog.create(payload);
