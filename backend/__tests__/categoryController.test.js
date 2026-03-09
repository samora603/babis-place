const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');
const Category = require('../models/Category');
const User = require('../models/User');
const { generateTokens } = require('../config/jwt');

let mongoServer;
let adminToken;
let customerToken;
jest.setTimeout(60000);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Mock env
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';

    const adminUser = await User.create({
        phone: '+254799999999',
        role: 'admin',
        isVerified: true
    });
    adminToken = generateTokens({ id: adminUser._id, role: adminUser.role }).accessToken;

    const customerUser = await User.create({
        phone: '+254711111111',
        role: 'customer',
        isVerified: true
    });
    customerToken = generateTokens({ id: customerUser._id, role: customerUser.role }).accessToken;
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    await Category.deleteMany();
});

describe('Category Controller', () => {
    it('POST /api/categoriesshould allow admin to create a category', async () => {
        const res = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Electronics', description: 'Gadgets' });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.name).toBe('Electronics');
        expect(res.body.data.slug).toBe('electronics');
    });

    it('POST /api/categories should forbid customer from creating category', async () => {
        const res = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ name: 'Furniture' });

        expect(res.statusCode).toBe(403);
    });

    it('GET /api/categories should return active categories publicly', async () => {
        await Category.create({ name: 'Tech' });
        await Category.create({ name: 'Inactive Tech', isActive: false });

        const res = await request(app).get('/api/categories');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe('Tech');
    });
});
