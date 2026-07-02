import mongoose from 'mongoose';

const commandSchema = new mongoose.Schema(
  {
    interactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    commandType: {
      type: String,
      enum: ['report', 'status', 'component', 'modal'],
      required: true,
      index: true,
    },
    commandName: {
      type: String,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    guildId: {
      type: String,
      default: null,
      index: true,
    },
    channelId: {
      type: String,
      default: null,
    },
    requestContent: {
      type: String,
      default: '',
    },
    responseMessage: {
      type: String,
      default: '',
    },
    aiSummary: String,
    aiCategory: String,
    aiPriority: String,
    aiError: String,
    mirrorStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'skipped'],
      default: 'pending',
      index: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'processing'],
      default: 'processing',
      index: true,
    },
    errorMessage: String,
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

commandSchema.index({ createdAt: -1, commandType: 1 });
commandSchema.index({ status: 1, createdAt: -1 });

export const Command = mongoose.model('Command', commandSchema);
