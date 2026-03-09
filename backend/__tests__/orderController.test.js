const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');
const { generateTokens } = require('../config/jwt');

let mongoServer;
let customerToken;
let customerId;
let testProduct;

jest.setTimeout(60000);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';

    const customerUser = await User.create({
        phone: '+254711111111',
        name: 'John Doe',
        role: 'customer',
        isVerified: true
    });
    customerId = customerUser._id;
    customerToken = generateTokens({ id: customerUser._id, role: customerUser.role }).accessToken;

    const testCategory = await Category.create({ name: 'Furniture' });
    testProduct = await Product.create({
        name: 'Test Desk',
        description: 'Test Item',
        price: 1000,
        category: testCategory._id,
        stock: 10,
    });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    await Cart.deleteMany();
    await Order.deleteMany();
    // Reset product stock
    await Product.findByIdAndUpdate(testProduct._id, { stock: 10, soldCount: 0 });
});

describe('Order Controller', () => {
    describe('POST /api/orders (Checkout)', () => {
        it('should fail if cart is empty', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    deliveryType: 'delivery',
                    customerPhone: '+254711111111',
                    customerName: 'John Doe',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Cart is empty');
        });

        it('should create an order, calculate totals, decrement stock, and clear cart', async () => {
            // Seed a cart
            await Cart.create({
                user: customerId,
                items: [{ product: testProduct._id, quantity: 2 }]
            });

            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    deliveryType: 'delivery',
                    customerPhone: '+254711111111',
                    customerName: 'John Doe',
                    deliveryAddress: { street: 'Moi Ave' }
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);

            const order = res.body.data;
            expect(order.orderNumber).toContain('BP-');
            expect(order.items.length).toBe(1);
            expect(order.subtotal).toBe(2000); // 1000 * 2
            expect(order.deliveryFee).toBe(100);
            expect(order.totalAmount).toBe(2100);
            expect(order.orderStatus).toBe('awaiting_payment');

            // Verify Stock Decremented
            const productCheck = await Product.findById(testProduct._id);
            expect(productCheck.stock).toBe(8); // 10 - 2
            expect(productCheck.soldCount).toBe(2);

            // Verify Cart Cleared
            const cartCheck = await Cart.findOne({ user: customerId });
            expect(cartCheck.items.length).toBe(0);
        });

        it('should fail if requested quantity exceeds stock', async () => {
            // Seed a cart
            await Cart.create({
                user: customerId,
                items: [{ product: testProduct._id, quantity: 20 }] // Stock is only 10
            });

            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({
                    deliveryType: 'pickup',
                    customerPhone: '+254711111111',
                    customerName: 'John Doe',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Insufficient stock');
        });
    });

    describe('GET /api/orders', () => {
        it('should get a list of the user\'s orders', async () => {
            await Order.create({
                user: customerId,
                orderNumber: 'BP-00001',
                items: [],
                subtotal: 1000,
                totalAmount: 1100,
                deliveryType: 'delivery',
                customerPhone: '0711111111'
            });

            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].orderNumber).toBe('BP-00001');
        });
    });

    describe('PUT /api/orders/:id/cancel', () => {
        it('should cancel an awaiting_payment order and restore stock', async () => {
            const order = await Order.create({
                user: customerId,
                orderNumber: 'BP-00002',
                items: [{ product: testProduct._id, quantity: 2, price: 1000 }],
                subtotal: 2000,
                totalAmount: 2100,
                deliveryType: 'delivery',
                customerPhone: '0711111111',
                orderStatus: 'awaiting_payment'
            });

            // Manually decrement to simulate it having just been bought
            await Product.findByIdAndUpdate(testProduct._id, { stock: 8, soldCount: 2 });

            const res = await request(app)
                .put(`/api/orders/${order._id}/cancel`)
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ reason: 'Changed mind' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.orderStatus).toBe('cancelled');
            expect(res.body.data.cancelReason).toBe('Changed mind');

            // Verify Stock Restored
            const productCheck = await Product.findById(testProduct._id);
            expect(productCheck.stock).toBe(10);
            expect(productCheck.soldCount).toBe(0);
        });
    });
});
