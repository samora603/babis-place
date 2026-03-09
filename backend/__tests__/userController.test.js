const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const { generateTokens } = require('../config/jwt');

let mongoServer;
let testUser;
let testToken;
jest.setTimeout(60000);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    testUser = await User.create({
        phone: '+254700000000',
        name: 'Test Customer',
        email: 'test@example.com',
        isVerified: true
    });
    const { accessToken } = generateTokens({ id: testUser._id, role: testUser.role });
    testToken = accessToken;
});

afterEach(async () => {
    await User.deleteMany();
});

describe('User Controller', () => {
    describe('GET /api/users/profile', () => {
        it('should get current user profile', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.name).toBe('Test Customer');
            expect(res.body.user.phone).toBe('+254700000000');
        });

        it('should fail if no token is provided', async () => {
            const res = await request(app).get('/api/users/profile');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/users/profile', () => {
        it('should update user profile (name and email)', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    name: 'Updated Name',
                    email: 'updated@example.com'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.name).toBe('Updated Name');
            expect(res.body.user.email).toBe('updated@example.com');

            // Verify in DB
            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser.name).toBe('Updated Name');
        });
    });

    describe('Address Management', () => {
        let addressId;

        it('POST /api/users/addresses should add an address', async () => {
            const newAddress = {
                label: 'Home',
                street: 'Moi Avenue',
                building: 'Bazaar Plaza',
            };

            const res = await request(app)
                .post('/api/users/addresses')
                .set('Authorization', `Bearer ${testToken}`)
                .send(newAddress);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.addresses.length).toBe(1);
            expect(res.body.addresses[0].street).toBe('Moi Avenue');

            addressId = res.body.addresses[0]._id;
        });

        it('PUT /api/users/addresses/:id should update an address', async () => {
            // First add an address
            testUser.addresses.push({
                label: 'Work',
                street: 'Kenyatta Avenue',
            });
            await testUser.save();
            const addrId = testUser.addresses[0]._id;

            const res = await request(app)
                .put(`/api/users/addresses/${addrId}`)
                .set('Authorization', `Bearer ${testToken}`)
                .send({ street: 'Kimathi Street' });

            expect(res.statusCode).toBe(200);
            expect(res.body.addresses[0].street).toBe('Kimathi Street');
        });

        it('DELETE /api/users/addresses/:id should delete an address', async () => {
            // First add an address
            testUser.addresses.push({
                label: 'Work',
                street: 'Kenyatta Avenue',
            });
            await testUser.save();
            const addrId = testUser.addresses[0]._id;

            const res = await request(app)
                .delete(`/api/users/addresses/${addrId}`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.addresses.length).toBe(0);
        });
    });
});
