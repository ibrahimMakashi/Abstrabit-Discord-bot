import { RetryQueue } from '../models/RetryQueue.js';
import { getCommandById, updateCommandRecord } from './commandService.js';
import { getSettingsByGuildId } from './settingsService.js';
import { sendMirrorNotification } from './mirrorService.js';

export const processRetryQueue = async () => {
  const jobs = await RetryQueue.find({
    status: 'pending',
    runAt: { $lte: new Date() },
  })
    .sort({ runAt: 1 })
    .limit(10);

  for (const job of jobs) {
    job.status = 'processing';
    await job.save();

    try {
      const command = await getCommandById(job.payload.commandId);

      if (!command) {
        job.status = 'failed';
        job.lastError = 'Command not found';
        await job.save();
        continue;
      }

      const settings = (await getSettingsByGuildId(command.guildId)) || {
        mirrorWebhookUrl: null,
      };
      const result = await sendMirrorNotification({
        command,
        settings,
        attempt: job.attempt + 1,
      });

      if (result.status === 'sent') {
        job.status = 'completed';
        await updateCommandRecord(command.id, {
          mirrorStatus: 'sent',
          retryCount: job.attempt + 1,
        });
      } else if (job.attempt + 1 >= job.maxAttempts) {
        job.status = 'failed';
        await updateCommandRecord(command.id, {
          mirrorStatus: 'failed',
          retryCount: job.attempt + 1,
        });
      } else {
        job.status = 'pending';
      }

      await job.save();
    } catch (error) {
      job.status = 'failed';
      job.lastError = error.message;
      await job.save();
    }
  }
};
