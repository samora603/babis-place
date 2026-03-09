const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const { generateTokens } = require('../config/jwt');

let mongoServer;
let adminToken;
let testCategory;
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

    testCategory = await Category.create({ name: 'Furniture' });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    await Product.deleteMany();
});

describe('Product & Inventory Controller', () => {
    describe('Product Core CRUD', () => {
        it('POST /api/products should create a product if admin', async () => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Leather Sofa',
                    description: 'Comfortable sofa',
                    price: 25000,
                    category: testCategory._id,
                    stock: 5,
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Leather Sofa');
            expect(res.body.data.slug).toContain('leather-sofa');
            expect(res.body.data.stock).toBe(5);
        });

        it('GET /api/products should return products and handle pagination', async () => {
            // Seed 25 products
            const products = Array.from({ length: 25 }).map((_, i) => ({
                name: `Product ${i}`,
                slug: `product-${i}`, // explicitly provide slug since pre-save isn't triggered by insertMany
                description: `Desc ${i}`,
                price: 100 * i,
                category: testCategory._id,
                stock: 10,
            }));
            await Product.insertMany(products);

            const res = await request(app).get('/api/products?page=1&limit=10');

            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(10);
            expect(res.body.total).toBe(25);
            expect(res.body.pages).toBe(3);
        });

        it('GET /api/products/:slug should return a single product', async () => {
            const prod = await Product.create({
                name: 'Test Item',
                description: 'test desc',
                price: 100,
                category: testCategory._id,
            });

            const res = await request(app).get(`/api/products/${prod.slug}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.data.name).toBe('Test Item');
            expect(res.body.data.views).toBe(1); // Views should increment
        });
    });

    describe('Inventory Management', () => {
        let lowStockProduct;
        let highStockProduct;

        beforeEach(async () => {
            lowStockProduct = await Product.create({
                name: 'Low Stock Item',
                description: 'few left',
                price: 100,
                category: testCategory._id,
                stock: 2,
                lowStockThreshold: 5,
            });

            highStockProduct = await Product.create({
                name: 'High Stock Item',
                description: 'many left',
                price: 100,
                category: testCategory._id,
                stock: 50,
                lowStockThreshold: 5,
            });
        });

        it('GET /api/inventory/low-stock should only return products under threshold', async () => {
            const res = await request(app)
                .get('/api/inventory/low-stock')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].name).toBe('Low Stock Item');
        });

        it('PUT /api/inventory/:id/stock should update stock limits', async () => {
            const res = await request(app)
                .put(`/api/inventory/${lowStockProduct._id}/stock`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ stock: 20 });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.stock).toBe(20);

            // Verify it no longer appears in low stock
            const check = await request(app)
                .get('/api/inventory/low-stock')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(check.body.data.length).toBe(0);
        });
    });
});
