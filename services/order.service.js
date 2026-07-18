const Order = require('../models/order.model');
const OrderStatusHistory = require('../models/orderStatusHistory.model');
const ApiError = require('../utils/ApiError');
const { ORDER_STATUS } = require('../utils/orderStatus');

async function createOrder(payload) {
  const { idempotencyKey } = payload;

  if (!idempotencyKey) {
    throw new ApiError(400, 'idempotencyKey is required to prevent duplicate order creation');
  }
  const existing = await Order.findOne({ idempotencyKey });
  if (existing) {
    return { order: existing, wasDuplicate: true };
  }

  try {
    const order = await Order.create({
      ...payload,
      orderStatus: ORDER_STATUS.PLACED,
      statusUpdatedAt: new Date(),
    });

    await OrderStatusHistory.create({
      order: order._id,
      orderId: order.orderId,
      fromStatus: null,
      toStatus: ORDER_STATUS.PLACED,
      changedBy: 'API',
      note: 'Order created',
    });

    return { order, wasDuplicate: false };
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.idempotencyKey) {
      const winner = await Order.findOne({ idempotencyKey });
      return { order: winner, wasDuplicate: true };
    }
    throw err;
  }
}
async function listOrders({ status, page = 1, limit = 20, search }) {
  const query = {};

  if (status) {
    query.orderStatus = status;
  }
  if (search) {
    query.$or = [
      { orderId: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(query),
  ]);
  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}
async function getOrderById(orderId) {
  const order = await Order.findOne({ orderId });
  if (!order) {
    throw new ApiError(404, `Order with id ${orderId} not found`);
  }
  return order;
}
async function getOrderHistory(orderId) {
  const order = await Order.findOne({ orderId });
  if (!order) {
    throw new ApiError(404, `Order with id ${orderId} not found`);
  }
  return OrderStatusHistory.find({ order: order._id }).sort({ createdAt: 1 });
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  getOrderHistory,
};
