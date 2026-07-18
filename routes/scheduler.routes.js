const express = require('express');
const schedulerController = require('../controller/scheduler.controller');
const schedulerAuth = require('../middleware/schedulerAuth.middleware');

const router = express.Router();

router.post('/run-status-update', schedulerAuth, schedulerController.triggerStatusUpdate);
router.get('/logs', schedulerController.getSchedulerLogs);

module.exports = router;
