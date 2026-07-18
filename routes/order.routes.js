const express = require('express');
const { createOrder, getOrders, getOrderById, getOrderHistory } = require('../controller/order.controller');

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:orderId', getOrderById);
router.get('/:orderId/history', getOrderHistory);

module.exports = router;
