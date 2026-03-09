const axios = require('axios');

const MPESA_BASE_URL =
    process.env.MPESA_ENV === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

/**
 * Get OAuth token from Daraja
 */
const getMpesaToken = async () => {
    const auth = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const { data } = await axios.get(
        `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${auth}` } }
    );
    return data.access_token;
};

/**
 * Generate LipaNaMpesa password (base64 of shortcode+passkey+timestamp)
 */
const getLnmPassword = (timestamp) => {
    const raw = `${process.env.MPESA_BUSINESS_SHORT_CODE}${process.env.MPESA_PASSKEY}${timestamp}`;
    return Buffer.from(raw).toString('base64');
};

/**
 * Format timestamp: YYYYMMDDHHmmss
 */
const getTimestamp = () => {
    return new Date()
        .toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, 14);
};

module.exports = { getMpesaToken, getLnmPassword, getTimestamp, MPESA_BASE_URL };
