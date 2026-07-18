const ORDER_STATUS = Object.freeze({
  PLACED: 'PLACED',
  PROCESSING: 'PROCESSING',
  READY_TO_SHIP: 'READY_TO_SHIP',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
});
const PAYMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
});
const AUTO_TRANSITIONS = [
  {
    from: ORDER_STATUS.PLACED,
    to: ORDER_STATUS.PROCESSING,
    afterMinutesEnvKey: 'placedToProcessingMinutes',
  },
  {
    from: ORDER_STATUS.PROCESSING,
    to: ORDER_STATUS.READY_TO_SHIP,
    afterMinutesEnvKey: 'processingToReadyMinutes',
  },
];
const ALL_STATUSES = Object.values(ORDER_STATUS);
const ALL_PAYMENT_STATUSES = Object.values(PAYMENT_STATUS);

module.exports = {
  ORDER_STATUS,
  PAYMENT_STATUS,
  AUTO_TRANSITIONS,
  ALL_STATUSES,
  ALL_PAYMENT_STATUSES,
};
