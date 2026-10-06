import request from 'supertest';
import app from '../app.js';

describe('GET /tasks', () => {
    test('rejects unauthenticated request', async () => {
        const response = await request(app)
            .get('/tasks');

        expect(response.statusCode).toBe(401);
    });
});