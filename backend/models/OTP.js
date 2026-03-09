const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            match: [/^\+254[0-9]{9}$/, 'Phone must be in format +254XXXXXXXXX'],
        },
        code: { type: String, required: true },
        purpose: {
            type: String,
            enum: ['login', 'register', 'password_reset'],
            default: 'login',
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000),
        },
        used: { type: Boolean, default: false },
        attempts: { type: Number, default: 0, max: 5 },
    },
    { timestamps: true }
);

// TTL index: auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phone: 1, purpose: 1 });

module.exports = mongoose.model('OTP', otpSchema);
