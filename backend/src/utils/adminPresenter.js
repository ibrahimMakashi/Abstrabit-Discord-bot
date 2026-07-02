export const sanitizeAdmin = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  lastLoginAt: admin.lastLoginAt,
  createdAt: admin.createdAt,
  avatarUrl: admin.avatarUrl || null,
  hasAvatar: Boolean(admin.avatarUrl),
});
