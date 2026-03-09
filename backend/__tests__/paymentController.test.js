const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');
const Order = require('../models/Order');
const User = require('../models/User');
const { generateTokens } = require('../config/jwt');
const axios = require('axios'); // for mocking

// Mock axios so we don't actually hit Daraja API
jest.mock('axios');

let mongoServer;
let customerToken;
let customerId;
let testOrder;

jest.setTimeout(60000);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    process.env.MPESA_BUSINESS_SHORT_CODE = '174379';
    process.env.MPESA_PASSKEY = 'test_passkey';
    process.env.MPESA_CONSUMER_KEY = 'test_consumer';
    process.env.MPESA_CONSUMER_SECRET = 'test_secret';

    const customerUser = await User.create({
        phone: '+254711111111',
        name: 'John Doe',
        role: 'customer',
        isVerified: true
    });
    customerId = customerUser._id;
    customerToken = generateTokens({ id: customerUser._id, role: customerUser.role }).accessToken;
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    testOrder = await Order.create({
        user: customerId,
        orderNumber: 'BP-12345',
        items: [{ product: new mongoose.Types.ObjectId(), quantity: 1, price: 500 }],
        subtotal: 500,
        totalAmount: 500,
        deliveryType: 'pickup',
        customerPhone: '0711111111',
        orderStatus: 'awaiting_payment',
        paymentStatus: 'pending'
    });
});

afterEach(async () => {
    await Order.deleteMany();
    jest.clearAllMocks();
});

describe('Payment Controller (M-Pesa STK Push)', () => {
    describe('POST /api/payment/stk-push', () => {
        it('should successfully initiate an STK push', async () => {
            // Mock the Daraja Token Response
            axios.get.mockResolvedValueOnce({
                data: { access_token: 'mocked_daraja_token' }
            });

            // Mock the Daraja STK Push Request Response
            axios.post.mockResolvedValueOnce({
                data: {
                    ResponseCode: '0',
                    CheckoutRequestID: 'ws_CO_1234567890',
                    ResponseDescription: 'Success'
                }
            });

            const res = await request(app)
                .post('/api/payment/stk-push')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    orderId: testOrder._id,
                    phone: '0711111111'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.checkoutRequestId).toBe('ws_CO_1234567890');

            // Verify order was updated with RequestID
            const updatedOrder = await Order.findById(testOrder._id);
            expect(updatedOrder.mpesaCheckoutRequestId).toBe('ws_CO_1234567890');
        });

        it('should fail if order is already paid', async () => {
            await Order.findByIdAndUpdate(testOrder._id, { paymentStatus: 'paid' });

            const res = await request(app)
                .post('/api/payment/stk-push')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    orderId: testOrder._id,
                    phone: '0711111111'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Order already paid');
        });
    });

    describe('POST /api/payment/callback', () => {
        it('should process a successful Safaricom Callback and update order to paid', async () => {
            // Setup an order waiting for callback
            await Order.findByIdAndUpdate(testOrder._id, { mpesaCheckoutRequestId: 'ws_CO_0987654321' });

            // Simulate Daraja POST callback
            const darajaPayload = {
                Body: {
                    stkCallback: {
                        MerchantRequestID: '12345',
                        CheckoutRequestID: 'ws_CO_0987654321',
                        ResultCode: 0,
                        ResultDesc: 'The service request is processed successfully.',
                        CallbackMetadata: {
                            Item: [
                                { Name: 'Amount', Value: 500 },
                                { Name: 'MpesaReceiptNumber', Value: 'QWE123RTY' },
                                { Name: 'PhoneNumber', Value: 254711111111 }
                            ]
                        }
                    }
                }
            };

            const res = await request(app)
                .post('/api/payment/callback')
                .send(darajaPayload);

            // Daraja always expects 200 OK
            expect(res.statusCode).toBe(200);

            // Verify the order updated in DB
            const check = await Order.findById(testOrder._id);
            expect(check.paymentStatus).toBe('paid');
            expect(check.orderStatus).toBe('confirmed');
            expect(check.mpesaReceiptNumber).toBe('QWE123RTY');
        });

        it('should process a failed Safaricom Callback (e.g., cancelled by user)', async () => {
            await Order.findByIdAndUpdate(testOrder._id, { mpesaCheckoutRequestId: 'ws_CO_FAILED_123' });

            const darajaPayload = {
                Body: {
                    stkCallback: {
                        MerchantRequestID: '12345',
                        CheckoutRequestID: 'ws_CO_FAILED_123',
                        ResultCode: 1032,
                        ResultDesc: 'Request cancelled by user',
                    }
                }
            };

            const res = await request(app)
                .post('/api/payment/callback')
                .send(darajaPayload);

            expect(res.statusCode).toBe(200); // Still must acknowledge Safaricom

            const check = await Order.findById(testOrder._id);
            expect(check.paymentStatus).toBe('failed');
            expect(check.orderStatus).toBe('awaiting_payment'); // Or remains unchanged depending on business logic
        });
    });
});
