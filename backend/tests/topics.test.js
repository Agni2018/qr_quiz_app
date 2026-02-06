const request = require('supertest');
const app = require('../server');
const Topic = require('../models/Topic');
const mongoose = require('mongoose');

// Mock Topic model
jest.mock('../models/Topic');

// Mock auth middleware to bypass authentication for these tests
jest.mock('../middleware/authMiddleware', () => ({
    protect: (req, res, next) => {
        req.user = { id: 'testuser', role: 'admin' };
        next();
    }
}));

describe('Topic Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/topics', () => {
        it('should return all topics', async () => {
            const mockTopics = [
                { _id: '1', name: 'Math', description: 'Math Quiz' },
                { _id: '2', name: 'Science', description: 'Science Quiz' }
            ];

            // The controller uses sort, so we need to mock that chain
            Topic.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockTopics)
            });

            const res = await request(app).get('/api/topics');

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(2);
            expect(res.body[0].name).toBe('Math');
        });
    });

    describe('POST /api/topics', () => {
        it('should create a new topic', async () => {
            const newTopicData = { name: 'History', description: 'History Quiz' };

            // Cleanest way to mock the constructor and save
            Topic.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue({ _id: '3', ...newTopicData })
            }));

            const res = await request(app)
                .post('/api/topics')
                .send(newTopicData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.name).toBe('History');
        });
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
