import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      unique: true,
      index: true,
    },
    guildId: {
      type: String,
      trim: true,
    },
    mainChannelIdEnc: String,
    mirrorChannelIdEnc: String,
    mirrorWebhookUrlEnc: String,
    enableAI: {
      type: Boolean,
      default: true,
    },
    enableNotifications: {
      type: Boolean,
      default: true,
    },
    autoReply: {
      type: Boolean,
      default: true,
    },
    commandConfiguration: {
      reportEnabled: {
        type: Boolean,
        default: true,
      },
      statusEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true },
);

settingsSchema.index({ guildId: 1 }, { unique: true, sparse: true });

export const Settings = mongoose.model('Settings', settingsSchema);
