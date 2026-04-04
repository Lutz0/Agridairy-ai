const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

router.post('/mpesa', authMiddleware, paymentController.initiateSTKPush);
router.post('/callback', paymentController.mpesaCallback);
router.post('/simulate-success', authMiddleware, paymentController.simulateSuccess);

module.exports = router;
