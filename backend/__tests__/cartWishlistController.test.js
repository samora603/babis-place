const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
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
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
    });

    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';

    const customerUser = await User.create({
        phone: '+254711111111',
        role: 'customer',
        isVerified: true
    });
    customerId = customerUser._id;
    customerToken = generateTokens({ id: customerUser._id, role: customerUser.role }).accessToken;

    const testCategory = await Category.create({ name: 'Furniture' });
    testProduct = await Product.create({
        name: 'Test Product',
        description: 'Test Item',
        price: 500,
        category: testCategory._id,
        stock: 5,
    });
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
});

afterEach(async () => {
    await Cart.deleteMany();
    await Wishlist.deleteMany();
});

describe('Cart & Wishlist Controller', () => {
    describe('Cart Management', () => {
        it('GET /api/cart should return an empty cart if not created', async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.items).toEqual([]);
        });

        it('POST /api/cart should add an item to the cart', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: testProduct._id, quantity: 2 });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items.length).toBe(1);
            expect(res.body.data.items[0].quantity).toBe(2);
            expect(res.body.data.items[0].product._id.toString()).toBe(testProduct._id.toString());
        });

        it('POST /api/cart should fail if stock is insufficient', async () => {
            const res = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: testProduct._id, quantity: 10 }); // Stock is only 5

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Insufficient stock');
        });

        it('DELETE /api/cart should clear the whole cart', async () => {
            // Seed a cart
            await Cart.create({
                user: customerId,
                items: [{ product: testProduct._id, quantity: 1 }]
            });

            const res = await request(app)
                .delete('/api/cart')
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Cart cleared');

            const cart = await Cart.findOne({ user: customerId });
            expect(cart.items.length).toBe(0);
        });
    });

    describe('Wishlist Management', () => {
        it('POST /api/wishlist should add an item to wishlist', async () => {
            const res = await request(app)
                .post('/api/wishlist')
                .set('Authorization', `Bearer ${customerToken}`)
                .send({ productId: testProduct._id });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.products).toContain(testProduct._id.toString());
        });

        it('DELETE /api/wishlist/:productId should remove the item', async () => {
            await Wishlist.create({
                user: customerId,
                products: [testProduct._id]
            });

            const res = await request(app)
                .delete(`/api/wishlist/${testProduct._id}`)
                .set('Authorization', `Bearer ${customerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.products.length).toBe(0);
        });
    });
});
