const mongoose = require('mongoose');
const schedulerLogSchema = new mongoose.Schema(
  {
    runId: {
      type: String,
      required: true,
      unique: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    finishedAt: {
      type: Date,
    },
    durationMs: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'PARTIAL_FAILURE', 'FAILED'],
      default: 'SUCCESS',
    },
    ordersScanned: {
      type: Number,
      default: 0,
    },
    ordersUpdated: {
      type: Number,
      default: 0,
    },
    // Small breakdown so the dashboard can show "12 moved PLACED->PROCESSING, 3 moved PROCESSING->READY_TO_SHIP"
    transitionsSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SchedulerLog', schedulerLogSchema);
