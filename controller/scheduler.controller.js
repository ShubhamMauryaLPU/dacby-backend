const schedulerService = require('../services/scheduler.service');
const SchedulerLog = require('../models/schedulerLog.model');
const asyncHandler = require('../utils/asyncHandler');

const triggerStatusUpdate = asyncHandler(async (req, res) => {
  const log = await schedulerService.runSchedulerPass();
  res.status(200).json({
    success: true,
    message: 'Scheduler pass completed',
    data: log,
  });
});

// GET /api/v1/scheduler/logs?page=1&limit=20
// Bonus: powers a "scheduler logs dashboard" in the frontend.
const getSchedulerLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    SchedulerLog.find().sort({ startedAt: -1 }).skip(skip).limit(Number(limit)),
    SchedulerLog.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

module.exports = { triggerStatusUpdate, getSchedulerLogs };
