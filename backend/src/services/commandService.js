import mongoose from 'mongoose';
import { Command } from '../models/Command.js';

export const createCommandRecord = async (payload) => Command.create(payload);

export const updateCommandRecord = async (commandId, updates) =>
  Command.findByIdAndUpdate(commandId, updates, { new: true });

const emptyDashboardSummary = () => ({
  totalCommands: 0,
  todaysCommands: 0,
  recentActivity: [],
  recentErrors: [],
  latestReports: [],
  latestStatusCommands: [],
});

const emptyAnalyticsSummary = () => ({
  series: [],
  totals: {
    totalCommands: 0,
    successRate: 0,
    failureRate: 0,
    averageResponseTime: 0,
  },
});

const buildGuildFilter = (guildId) => (guildId ? { guildId } : null);

export const getCommandLogs = async ({
  page,
  pageSize,
  search,
  status,
  commandType,
  sortBy,
  sortOrder,
  guildId,
}) => {
  const filter = buildGuildFilter(guildId) || { guildId: '__unconfigured__' };

  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { commandName: { $regex: search, $options: 'i' } },
      { requestContent: { $regex: search, $options: 'i' } },
      { responseMessage: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (commandType) {
    filter.commandType = commandType;
  }

  const [items, total] = await Promise.all([
    Command.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Command.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
    },
  };
};

export const getDashboardSummary = async (guildId) => {
  const filter = buildGuildFilter(guildId);

  if (!filter) {
    return emptyDashboardSummary();
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalCommands, todaysCommands, recentActivity, recentErrors, latestReports, latestStatusCommands] =
    await Promise.all([
      Command.countDocuments(filter),
      Command.countDocuments({ ...filter, createdAt: { $gte: startOfDay } }),
      Command.find(filter).sort({ createdAt: -1 }).limit(10).lean(),
      Command.find({ ...filter, status: 'failed' }).sort({ createdAt: -1 }).limit(5).lean(),
      Command.find({ ...filter, commandType: 'report' }).sort({ createdAt: -1 }).limit(5).lean(),
      Command.find({ ...filter, commandType: 'status' }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  return {
    totalCommands,
    todaysCommands,
    recentActivity,
    recentErrors,
    latestReports,
    latestStatusCommands,
  };
};

export const getAnalyticsSummary = async (guildId) => {
  const matchStage = buildGuildFilter(guildId);

  if (!matchStage) {
    return emptyAnalyticsSummary();
  }

  const commandSeries = await Command.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        commands: { $sum: 1 },
        reports: {
          $sum: {
            $cond: [{ $eq: ['$commandType', 'report'] }, 1, 0],
          },
        },
        successes: {
          $sum: {
            $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
          },
        },
        failures: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
          },
        },
        averageResponseTime: { $avg: '$executionTimeMs' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totals = await Command.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
          },
        },
        failureCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
          },
        },
        averageResponseTime: { $avg: '$executionTimeMs' },
      },
    },
  ]);

  const summary = totals[0] || {
    total: 0,
    successCount: 0,
    failureCount: 0,
    averageResponseTime: 0,
  };

  return {
    series: commandSeries.map((entry) => ({
      date: entry._id,
      commands: entry.commands,
      reports: entry.reports,
      successRate: entry.commands ? Number(((entry.successes / entry.commands) * 100).toFixed(2)) : 0,
      failureRate: entry.commands ? Number(((entry.failures / entry.commands) * 100).toFixed(2)) : 0,
      averageResponseTime: Number((entry.averageResponseTime || 0).toFixed(2)),
    })),
    totals: {
      totalCommands: summary.total,
      successRate: summary.total ? Number(((summary.successCount / summary.total) * 100).toFixed(2)) : 0,
      failureRate: summary.total ? Number(((summary.failureCount / summary.total) * 100).toFixed(2)) : 0,
      averageResponseTime: Number((summary.averageResponseTime || 0).toFixed(2)),
    },
  };
};

export const hasProcessedInteraction = async (interactionId) => {
  const existing = await Command.findOne({ interactionId }).select('_id').lean();
  return Boolean(existing);
};

export const getCommandById = async (commandId) => {
  if (!mongoose.Types.ObjectId.isValid(commandId)) {
    return null;
  }

  return Command.findById(commandId);
};
