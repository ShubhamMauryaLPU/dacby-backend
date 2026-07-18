const orderService = require('../services/order.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ALL_STATUSES } = require('../utils/orderStatus');

const createOrder = asyncHandler(async (req, res) => {
  const { customerName, phoneNumber, productName, amount, idempotencyKey, paymentStatus } = req.body;

  if (!customerName || !phoneNumber || !productName || amount === undefined) {
    throw new ApiError(400, 'customerName, phoneNumber, productName and amount are required');
  }

  const { order, wasDuplicate } = await orderService.createOrder({
    customerName,
    phoneNumber,
    productName,
    amount,
    paymentStatus,
    idempotencyKey,
  });

  res.status(wasDuplicate ? 200 : 201).json({
    success: true,
    message: wasDuplicate ? 'Order already existed for this idempotency key' : 'Order created',
    data: order,
  });
});


// GET /api/orders?status=PLACED&page=1&limit=20&search=shubham
const getOrders = asyncHandler(async (req, res) => {
  const { status, page, limit, search } = req.query;

  if (status && !ALL_STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid status filter. Allowed values: ${ALL_STATUSES.join(', ')}`);
  }

  const result = await orderService.listOrders({ status, page, limit, search });
  res.status(200).json({
    success: true,
    data: result.orders,
    pagination: result.pagination,
  });
});
const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  res.status(200).json({ success: true, data: order });
});
const getOrderHistory = asyncHandler(async (req, res) => {
  const history = await orderService.getOrderHistory(req.params.orderId);
  res.status(200).json({ success: true, data: history });
});

module.exports = { createOrder, getOrders, getOrderById, getOrderHistory };
