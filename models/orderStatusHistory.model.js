const mongoose = require('mongoose');
const { ALL_STATUSES } = require('../utils/orderStatus');

const orderStatusHistorySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    fromStatus: {
      type: String,
      enum: [...ALL_STATUSES, null],
      default: null,
    },
    toStatus: {
      type: String,
      enum: ALL_STATUSES,
      required: true,
    },
    changedBy: {
      type: String,
      enum: ['SYSTEM_SCHEDULER', 'USER', 'API'],
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);
