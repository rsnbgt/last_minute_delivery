const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// POST /api/delivery/request-otp
router.post('/request-otp', deliveryController.requestOTP);

// POST /api/delivery/confirm
router.post('/confirm', deliveryController.confirmDelivery);

// GET /api/delivery/history/:agentId
router.get('/history/:agentId', deliveryController.getDeliveryHistory);

module.exports = router;
