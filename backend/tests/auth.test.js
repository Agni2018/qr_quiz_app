/**
 * Last Test Run Status:
 * Test Suites: 1 passed, 1 total
 * Tests:       3 passed, 3 total
 * Result:      PASSED
 * Timestamp:   2026-02-02 (Last verified)
 */
const request = require('supertest');

const app = require('../server');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Mock User model
jest.mock('../models/User');
// Mock bcrypt
jest.mock('bcryptjs');
// Mock auth middleware
jest.mock('../middleware/authMiddleware', () => ({
    protect: (req, res, next) => {
        req.user = { id: 'testadmin', role: 'admin' };
        next();
    }
}));


describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should return 201 on successful registration', async () => {
            User.findOne.mockResolvedValue(null);
            User.prototype.save = jest.fn().mockResolvedValue(true);

            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'newuser', email: 'new@example.com', password: 'password123' });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User registered successfully');
        });

        it('should return 400 if user already exists', async () => {
            User.findOne.mockResolvedValue({ username: 'existing' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'existing', email: 'existing@example.com', password: 'password' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'User with this username or email already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should return 200 and pointsAwarded: true for first login of the day', async () => {
            const mockUser = {
                _id: '123',
                username: 'student',
                password: 'hashedpassword',
                role: 'student',
                points: 0,
                lastLoginDate: null,
                save: jest.fn().mockResolvedValue(true)
            };

            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'student', password: 'password123' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('pointsAwarded', true);
            expect(res.body).toHaveProperty('points', 5);
        });

        it('should return 200 and pointsAwarded: false if already logged in today', async () => {
            const mockUser = {
                _id: '123',
                username: 'student',
                password: 'hashedpassword',
                role: 'student',
                points: 10,
                lastLoginDate: new Date(),
                save: jest.fn().mockResolvedValue(true)
            };

            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'student', password: 'password123' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('pointsAwarded', false);
        });

        it('should return 401 for invalid credentials', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'wrong', password: 'password' });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Invalid credentials');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should return 200 on logout', async () => {
            const res = await request(app)
                .post('/api/auth/logout');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Logged out successfully');
        });
    });
});

// Close mongoose connection after all tests to avoid open handles
afterAll(async () => {
    await mongoose.connection.close();
});
