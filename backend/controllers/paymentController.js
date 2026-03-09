const axios = require('axios');
const Order = require('../models/Order');
const { getMpesaToken, getLnmPassword, getTimestamp, MPESA_BASE_URL } = require('../config/mpesa');

// @desc  Initiate M-Pesa STK Push
// @route POST /api/payment/stk-push
const initiateStkPush = async (req, res) => {
    const { orderId, phone } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.paymentStatus === 'paid') {
        return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    const token = await getMpesaToken();
    const timestamp = getTimestamp();
    const password = getLnmPassword(timestamp);

    // Normalize phone: 07... -> 2547...
    const normalizedPhone = phone.startsWith('0')
        ? '254' + phone.slice(1)
        : phone.replace('+', '');

    const payload = {
        BusinessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(order.totalAmount),
        PartyA: normalizedPhone,
        PartyB: process.env.MPESA_BUSINESS_SHORT_CODE,
        PhoneNumber: normalizedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: order.orderNumber,
        TransactionDesc: `Payment for order ${order.orderNumber}`,
    };

    const { data } = await axios.post(
        `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.ResponseCode === '0') {
        order.mpesaCheckoutRequestId = data.CheckoutRequestID;
        await order.save();
        res.json({ success: true, checkoutRequestId: data.CheckoutRequestID, message: 'STK Push sent to your phone' });
    } else {
        res.status(400).json({ success: false, message: data.errorMessage || 'STK Push failed' });
    }
};

// @desc  M-Pesa payment callback (Daraja calls this)
// @route POST /api/payment/callback
const mpesaCallback = async (req, res) => {
    const callbackData = req.body?.Body?.stkCallback;

    if (!callbackData) return res.status(400).json({ success: false });

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callbackData;

    const order = await Order.findOne({ mpesaCheckoutRequestId: CheckoutRequestID });
    if (!order) return res.status(200).json({ success: false }); // always 200 to Daraja

    if (ResultCode === 0) {
        // Payment successful
        const meta = {};
        CallbackMetadata?.Item?.forEach((item) => { meta[item.Name] = item.Value; });

        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.mpesaReceiptNumber = meta.MpesaReceiptNumber;
        order.statusHistory.push({ status: 'confirmed', note: `M-Pesa receipt: ${meta.MpesaReceiptNumber}` });
        await order.save();
    } else {
        order.paymentStatus = 'failed';
        await order.save();
    }

    // Always return 200 to Daraja
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
};

// @desc  Poll payment status (frontend polling)
// @route GET /api/payment/status/:orderId
const checkPaymentStatus = async (req, res) => {
    const order = await Order.findById(req.params.orderId).select('paymentStatus orderStatus mpesaReceiptNumber');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus, receipt: order.mpesaReceiptNumber });
};

module.exports = { initiateStkPush, mpesaCallback, checkPaymentStatus };
