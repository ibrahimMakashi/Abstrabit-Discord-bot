import axios from 'axios';
import { WebhookLog } from '../models/WebhookLog.js';
import { RetryQueue } from '../models/RetryQueue.js';
import { calculateRetryDelay } from '../utils/retry.js';

export const sendMirrorNotification = async ({ command, settings, attempt = 1 }) => {
  const targetUrl = settings?.mirrorWebhookUrl;

  if (!targetUrl) {
    return {
      status: 'skipped',
      reason: 'Mirror webhook is not configured',
    };
  }

  const payload = {
    content: [
      `New report from **${command.username}**`,
      `Message: ${command.requestContent}`,
      command.aiSummary ? `Summary: ${command.aiSummary}` : null,
      command.aiCategory ? `Category: ${command.aiCategory}` : null,
      command.aiPriority ? `Priority: ${command.aiPriority}` : null,
    ]
      .filter(Boolean)
      .join('\n'),
  };

  try {
    const response = await axios.post(targetUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    await WebhookLog.create({
      commandId: command.id,
      targetUrl,
      status: 'success',
      responseStatus: response.status,
      responseBody: response.data,
      attempt,
    });

    return {
      status: 'sent',
    };
  } catch (error) {
    await WebhookLog.create({
      commandId: command.id,
      targetUrl,
      status: 'failed',
      responseStatus: error.response?.status,
      responseBody: error.response?.data,
      errorMessage: error.message,
      attempt,
    });

    await RetryQueue.create({
      jobType: 'mirror-webhook',
      payload: { commandId: command.id },
      attempt,
      maxAttempts: 5,
      runAt: new Date(Date.now() + calculateRetryDelay(attempt)),
      status: 'pending',
      lastError: error.message,
    });

    return {
      status: 'failed',
      reason: error.message,
    };
  }
};
