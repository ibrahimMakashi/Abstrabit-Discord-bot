import { apiResponse } from '../utils/apiResponse.js';
import { getCommandLogs } from '../services/commandService.js';
import { getSettingsForAdmin } from '../services/settingsService.js';

export const getCommandLogsController = async (req, res) => {
  const settings = await getSettingsForAdmin(req.user.id);
  const logs = await getCommandLogs({
    ...req.validated.query,
    guildId: settings.guildId,
  });

  return res.json(
    apiResponse({
      message: 'Command logs loaded',
      data: logs,
    }),
  );
};
