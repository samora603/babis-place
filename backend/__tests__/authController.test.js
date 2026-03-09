const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');

let mongoServer;

jest.setTimeout(60000); // 60 seconds to allow for MongoDB Memory Server download

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Mock environment variables
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    process.env.OTP_EXPIRY_MINUTES = '5';
    process.env.NODE_ENV = 'development'; // Prevents real SMS sending
}, 60000);

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

describe('Auth Controller', () => {
    describe('POST /api/auth/request-otp', () => {
        it('should generate and save an OTP for a valid phone number', async () => {
            const res = await request(app)
                .post('/api/auth/request-otp')
                .send({ phone: '+254712345678' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('OTP sent successfully');

            // Verify it was saved to the DB
            const OTP = require('../models/OTP');
            const otpDoc = await OTP.findOne({ phone: '+254712345678' });
            expect(otpDoc).toBeTruthy();
            expect(otpDoc.code).toBeDefined();
            expect(otpDoc.used).toBe(false);
        });

        it('should fail if phone number is missing or invalid format', async () => {
            const res = await request(app)
                .post('/api/auth/request-otp')
                .send({ phone: '0712345678' }); // Invalid format without +254

            // The code currently doesn't have validation middleware before controller, 
            // so we expect mongoose validation to fail and express-async-errors to catch it.
            // When building APIs, it's best to have express-validator catch this and return 400.
            // Let's modify the controller to handle it gracefully in the future, 
            // but for now, we'll just check it doesn't succeed.
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Phone must be in format +254XXXXXXXXX');
        });
    });

    describe('POST /api/auth/verify-otp', () => {
        it('should verify OTP and create a new user', async () => {
            const OTP = require('../models/OTP');
            const code = '123456';
            const phone = '+254711111111';

            await OTP.create({ phone, code, purpose: 'login' });

            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ phone, code });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.isNewUser).toBe(true);
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
            expect(res.body.user.phone).toBe(phone);
            expect(res.body.user.isVerified).toBe(true);

            // Verify OTP is marked as used
            const usedOtp = await OTP.findOne({ phone, code });
            expect(usedOtp.used).toBe(true);
        });

        it('should fail with an invalid OTP', async () => {
            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ phone: '+254711111111', code: '000000' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid or expired OTP');
        });
    });
});
