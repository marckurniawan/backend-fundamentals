import request from 'supertest';
import app from '../app.js';
import pool from '../db.js'; 

let tokenUser1, tokenUser2;
let user1TaskId;

const register = async (email, username, password) => {
    return await request(app)
        .post('/register')
        .send({ email, username, password });
};


const login = async (identifier, password) => {
    return await request(app)
        .post('/login')
        .send({identifier, password});
}


beforeAll(async () => {
    await pool.query('TRUNCATE users, tasks RESTART IDENTITY CASCADE');

    const user1 = await register('marc@gmail.com', 'usntest', 'p@ssw0rd!');
    expect(user1.statusCode).toBe(201);

    const user2 = await register('usn@gmail.com', 'usntest2', 'p@ssrd!5');
    expect(user2.statusCode).toBe(201);
    
    const loginUser1 = await login('marc@gmail.com', 'p@ssw0rd!');
    tokenUser1 = loginUser1.body.token;

    expect(loginUser1.statusCode).toBe(200); 

    const loginUser2 = await login('usn@gmail.com', 'p@ssrd!5');
    tokenUser2 = loginUser2.body.token;
    
    expect(loginUser2.statusCode).toBe(200);

    const task = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
            title: 'Task milik User 1',
            status: 'pending',
            description: '-',
            urgency: 'medium',
            deadline: null
        });

    user1TaskId = task.body.id ; 

    expect(task.statusCode).toBe(201);
});

afterAll(async () => {
    await pool.end();
});

describe('GET /tasks', () => {
    test('users can only see their own tasks', async () => {
        const user1Response = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${tokenUser1}`);

        expect(user1Response.statusCode).toBe(200);
        expect(user1Response.body.some(
            task => task.id === user1TaskId
        )).toBe(true);

        const user2Response = await request(app)
            .get('/tasks')
            .set('Authorization', `Bearer ${tokenUser2}`);

        expect(user2Response.statusCode).toBe(200);
        expect(user2Response.body.some(
            task => task.id === user1TaskId
        )).toBe(false);
    });
});


describe('GET /tasks/:id', () => {
    test('rejects malformed id with 400', async () => {
        const res = await request(app)
            .get('/tasks/:7')
            .set('Authorization', `Bearer ${tokenUser1}`);

        expect(res.statusCode).toBe(400);
    });
    test('accepts access to user\'s own task', async () => {
        const res = await request(app)
            .get(`/tasks/${user1TaskId}`)
            .set('Authorization', `Bearer ${tokenUser1}`);

        expect(res.statusCode).toBe(200);
    });

    test('rejects access to another user\'s task', async () => {
        const res = await request(app)
            .get(`/tasks/${user1TaskId}`)
            .set('Authorization', `Bearer ${tokenUser2}`);

        expect(res.statusCode).toBe(404);
    });

});

describe('PATCH /tasks/:id', () => {
        test('rejects update another user\'s task', async () => {
        const res = await request(app)
            .patch(`/tasks/${user1TaskId}`)
            .set('Authorization', `Bearer ${tokenUser2}`)
            .send({
                title: 'Task milik User 2',
                status: 'pending',
                description: '-',
                urgency: 'high'
            });

        expect(res.statusCode).toBe(404);
        
        const ownerResponse = await request(app)
            .get(`/tasks/${user1TaskId}`)
            .set('Authorization', `Bearer ${tokenUser1}`);

        expect(ownerResponse.statusCode).toBe(200);
        expect(ownerResponse.body.title).toBe('Task milik User 1');
    });
})


describe('DELETE /tasks/:id', () => {
        
    test('rejects delete another user\'s task', async () => {
        const res = await request(app)
            .delete(`/tasks/${user1TaskId}`)
            .set('Authorization', `Bearer ${tokenUser2}`);

        expect(res.statusCode).toBe(404);

        const check = await request(app)
            .get(`/tasks/${user1TaskId}`)
            .set('Authorization', `Bearer ${tokenUser1}`);

        expect(check.statusCode).toBe(200);

    });
})