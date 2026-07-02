import mongoose from 'mongoose';

const retryQueueSchema = new mongoose.Schema(
  {
    jobType: {
      type: String,
      enum: ['mirror-webhook'],
      required: true,
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    attempt: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    runAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    lastError: String,
  },
  { timestamps: true },
);

export const RetryQueue = mongoose.model('RetryQueue', retryQueueSchema);
