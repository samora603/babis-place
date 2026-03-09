const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { requestOTP, verifyOTP, refreshToken, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Validation Middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
};

const phoneValidation = [
    body('phone')
        .matches(/^\+254[0-9]{9}$/)
        .withMessage('Phone must be in format +254XXXXXXXXX'),
];

router.post('/request-otp', authLimiter, phoneValidation, validateRequest, requestOTP);

router.post(
    '/verify-otp',
    authLimiter,
    [
        ...phoneValidation,
        body('code').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    ],
    validateRequest,
    verifyOTP
);

router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;

