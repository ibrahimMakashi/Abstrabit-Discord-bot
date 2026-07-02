import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
      index: true,
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
    lastLoginAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    avatarUrl: String,
    avatarPublicId: String,
  },
  {
    timestamps: true,
  },
);

export const Admin = mongoose.model('Admin', adminSchema);
