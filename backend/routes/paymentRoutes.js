const express = require('express');
const router = express.Router();
const { initiateStkPush, mpesaCallback, checkPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Customer initiates payment
router.post('/stk-push', protect, initiateStkPush);

// Daraja calls this — no auth (IP whitelisting recommended in production)
router.post('/callback', mpesaCallback);

// Frontend polls this for status
router.get('/status/:orderId', protect, checkPaymentStatus);

module.exports = router;
