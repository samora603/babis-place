const AfricasTalking = require('africastalking');

let client;

const getClient = () => {
    if (!client) {
        client = AfricasTalking({
            apiKey: process.env.AT_API_KEY,
            username: process.env.AT_USERNAME,
        });
    }
    return client;
};

/**
 * Send OTP via Africa's Talking SMS
 * @param {string} phone - E.164 format '+254XXXXXXXXX'
 * @param {string} code - 6-digit OTP code
 */
const sendOTP = async (phone, code) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV OTP] Phone: ${phone} | Code: ${code}`);
        return;
    }

    const sms = getClient().SMS;
    await sms.send({
        to: [phone],
        message: `Your Babis Place verification code is: ${code}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes. Do not share this code.`,
        from: 'BabisPlace',
    });
};

module.exports = { sendOTP };
