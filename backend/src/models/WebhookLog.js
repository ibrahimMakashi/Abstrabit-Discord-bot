import mongoose from 'mongoose';

const webhookLogSchema = new mongoose.Schema(
  {
    commandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Command',
      index: true,
    },
    targetUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
      index: true,
    },
    responseStatus: Number,
    responseBody: mongoose.Schema.Types.Mixed,
    errorMessage: String,
    attempt: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

export const WebhookLog = mongoose.model('WebhookLog', webhookLogSchema);
