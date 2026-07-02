import { logger } from '../config/logger.js';
import { updateCommandRecord } from './commandService.js';
import { generateReportInsights } from './aiService.js';
import { sendMirrorNotification } from './mirrorService.js';
import { buildReportReply } from './discordService.js';
import { emitSocketEvent } from '../socket/index.js';

export const processReportCommand = async ({ command, reportText, settings }) => {
  const startedAt = Date.now();

  const insights = settings.enableAI
    ? await generateReportInsights(reportText)
    : {
        summary: null,
        category: null,
        priority: null,
        error: null,
      };

  const updatedCommand = await updateCommandRecord(command.id, {
    aiSummary: insights.summary,
    aiCategory: insights.category,
    aiPriority: insights.priority,
    aiError: insights.error,
    responseMessage: buildReportReply({
      username: command.username,
      reportText,
      includeUsername: settings.autoReply,
    }),
    status: 'success',
    executionTimeMs: Date.now() - startedAt,
  });

  const mirrorResult = settings.enableNotifications
    ? await sendMirrorNotification({ command: updatedCommand, settings })
    : { status: 'skipped' };

  await updateCommandRecord(command.id, {
    mirrorStatus: mirrorResult.status,
  });

  emitSocketEvent('command:created', updatedCommand);
  emitSocketEvent('report:processed', {
    commandId: updatedCommand.id,
    mirrorStatus: mirrorResult.status,
    aiStatus: insights.error ? 'failed' : 'success',
  });

  return updatedCommand;
};

export const queueReportProcessing = ({ command, reportText, settings }) => {
  processReportCommand({ command, reportText, settings }).catch((error) => {
    logger.error({ err: error, commandId: command.id }, 'Background report processing failed');
    updateCommandRecord(command.id, {
      status: 'failed',
      errorMessage: error.message,
    }).catch((updateError) => {
      logger.error({ err: updateError, commandId: command.id }, 'Failed to persist report processing error');
    });
  });
};
