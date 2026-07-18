const { v4: uuidv4 } = require('uuid');
const Order = require('../models/order.model');
const OrderStatusHistory = require('../models/orderStatusHistory.model');
const SchedulerLog = require('../models/schedulerLog.model');
const { AUTO_TRANSITIONS } = require('../utils/orderStatus');

const envConfig = {
  schedulerSecretKey: process.env.SCHEDULER_SECRET_KEY,
  placedToProcessingMinutes: Number(process.env.PLACED_TO_PROCESSING_MINUTES || 10),
  processingToReadyMinutes: Number(process.env.PROCESSING_TO_READY_MINUTES || 20),
};

async function runSchedulerPass() {
  const runId = uuidv4();
  const startedAt = new Date();
  let ordersScanned = 0;
  let ordersUpdated = 0;
  const transitionsSummary = {};
  let status = 'SUCCESS';
  let errorMessage = null;

  try {
    for (const rule of AUTO_TRANSITIONS) {
      const thresholdMinutes = envConfig[rule.afterMinutesEnvKey];
      const cutoffTime = new Date(Date.now() - thresholdMinutes * 60 * 1000);
      const candidates = await Order.find({
        orderStatus: rule.from,
        statusUpdatedAt: { $lte: cutoffTime },
      }).select('_id orderId orderStatus');
      ordersScanned += candidates.length;
      for (const candidate of candidates) {
        const updated = await Order.findOneAndUpdate(
          { _id: candidate._id, orderStatus: rule.from },
          {
            $set: {
              orderStatus: rule.to,
              statusUpdatedAt: new Date(),
            },
            $inc: { __v: 1 },
          },
          { new: true }
        );
        if (updated) {
          ordersUpdated += 1;
          transitionsSummary[`${rule.from}->${rule.to}`] =
            (transitionsSummary[`${rule.from}->${rule.to}`] || 0) + 1;
          await OrderStatusHistory.create({
            order: updated._id,
            orderId: updated.orderId,
            fromStatus: rule.from,
            toStatus: rule.to,
            changedBy: 'SYSTEM_SCHEDULER',
            note: `Auto-transitioned after exceeding ${thresholdMinutes} minute threshold`,
          });
        }
      }
    }
  } catch (err) {
    status = 'FAILED';
    errorMessage = err.message;
  }

  const finishedAt = new Date();

  const log = await SchedulerLog.create({
    runId,
    startedAt,
    finishedAt,
    durationMs: finishedAt - startedAt,
    status,
    ordersScanned,
    ordersUpdated,
    transitionsSummary,
    errorMessage,
  });

  return log;
}

module.exports = { runSchedulerPass };
