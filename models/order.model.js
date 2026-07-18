const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { ORDER_STATUS, PAYMENT_STATUS, ALL_STATUSES, ALL_PAYMENT_STATUSES } = require('../utils/orderStatus');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      default: () => `ORD-${uuidv4()}`,
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ALL_PAYMENT_STATUSES,
      default: PAYMENT_STATUS.PENDING,
    },
    orderStatus: {
      type: String,
      enum: ALL_STATUSES,
      default: ORDER_STATUS.PLACED,
      index: true,
    },
    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
    versionKey: '__v',
  }
);

// Compound index to make status-filtered, paginated queries fast.
orderSchema.index({ orderStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
