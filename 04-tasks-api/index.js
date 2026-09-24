import pool from './db.js';
import express from 'express';    
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3000;

app.use(express.json());


const allowedUrgencies = ['low', 'medium', 'high'];
const allowedStatuses = ['pending', 'in-progress', 'completed'];

const sendError = (res, statusCode, message) => {
    return res.status(statusCode).json({
        error: message
    });
};

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if(!authHeader ||!authHeader.startsWith('Bearer ')){
        return sendError(res, 401, 'Authentication required');
    }
    const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;

            next();

        } catch (error) {
            return res.status(401).json({
                error: 'Invalid or expired token'
            });
        }
};

app.post('/register', async (req, res) => {
    try{
        const {email, username, password} = req.body;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return sendError(res, 400, 'Invalid email format');
        }
        
        const usernameRegex = /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9_]{3,25}$/;
        if(!usernameRegex.test(username)){
            return sendError(res, 400, 'Invalid username format');
        }

        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,25}$/;
        if(!passwordRegex.test(password)){
            return sendError(res, 400, 'Password must be 8-25 characters long and contain at least 1 letter, 1 number, and 1 special character');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(`INSERT INTO users (email, username, password)
                                        VALUES ($1, $2, $3)
                                        RETURNING id, username, email`,[email, username, hashedPassword]);
        return res.status(201).json(result.rows[0]);
        
    }
    catch(error){
        if(error.code === '23505'){
            return sendError(res, 409, 'Email or username has been used');
        }
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal server error');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if(!identifier?.trim() || !password?.trim()){

            return sendError(res, 400, "Email/username and password are required")
        }
        let result;

        if(identifier.includes('@')){
            result = await pool.query(
                'SELECT id, password FROM users WHERE email = $1',
                [identifier]
            );
        }
        else{
            result = await pool.query(
                'SELECT id, password FROM users WHERE username = $1',
                [identifier]
            );        
        }
        if (result.rows.length === 0) {
            return sendError(res, 401, 'Wrong email or password');
        }

        const user = result.rows[0];

        const matchPassword = await bcrypt.compare(password, user.password);
        
        if(!matchPassword){
            return sendError(res, 401, 'Wrong email or password');
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({ token });
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal server error');
    }
});

app.get('/tasks', authenticate,  async (req, res) => {
    try{
        const result = await pool.query(`SELECT * FROM tasks
                                         WHERE user_id = $1`,
                                         [req.userId]  
        );
        return res.json(result.rows);
    }
    catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal server error');
    }
}); 

// Create
app.post('/tasks', authenticate, async (req, res) => {
    try{
        const {title, status, description, deadline,  urgency} = req.body;

        if (typeof title !== 'string' || title.trim() === ''){
            return sendError(res, 400, "Title is required");
        }

        const taskUrgency = urgency ?? 'medium';

        if (!allowedUrgencies.includes(taskUrgency)) {
            return sendError(res, 400, "Urgency must be low, medium, or high.");
        }

        const taskStatus = status ?? 'pending';

        if(!allowedStatuses.includes(taskStatus)){
            return sendError(res, 400 ,  "Status must be pending, in-progress, or completed");
        }   
        
        if(deadline !== undefined && deadline !== null){
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(deadline)) {
                    return sendError(res, 400, "Deadline must be a valid date in YYYY-MM-DD format");
                }
            const [year, month, day] = deadline.split('-').map(Number);
            const parsedDate = new Date(deadline);

            const isValidDate = 
                parsedDate.getUTCFullYear() === year &&
                parsedDate.getUTCMonth() + 1 === month &&
                parsedDate.getUTCDate() === day;

            if (!isValidDate) {
                return sendError(res, 400, "Deadline is not a valid calendar date");
            }
        }

        

        const result = await pool.query(
            `INSERT INTO tasks (title, status, description, urgency, deadline, user_id) 
            VALUES($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
        [title.trim(), 
         taskStatus, 
         description ?? '-', 
         taskUrgency, 
         deadline ?? null,
         req.userId]
        );
        

        return res.status(201).json(result.rows[0]);
    }
    catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal Server Error');
    }
});

// Read
app.get('/tasks/:id', authenticate, async (req, res) => {
    try{
        const id = Number(req.params.id);
        
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, req.userId]);
        const task = result.rows[0];

        if(!task){
            return sendError(res, 404, "Task not Found");
        }


        return res.json(task);
    }catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal server error');
    }
});

app.patch('/tasks/:id', authenticate, async (req, res) =>{
    try{
        const id = Number(req.params.id);
    
        const  {title, status, description, urgency, deadline} = req.body;


        if (title !== undefined && (typeof title !== 'string' || title.trim() === "")) {
            return sendError(res, 400, "Title must be a non-empty string");
        }


        if (urgency !== undefined &&
            !allowedUrgencies.includes(urgency)){
            return sendError(res, 400, "Urgency must be low, medium, or high")        
        }


        if(status !== undefined && 
        !allowedStatuses.includes(status)){
                return sendError(res, 400, "Status must be pending, in-progress, or completed");
        }

        if (deadline !== undefined && deadline !== null) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(deadline)) {
                return sendError(res, 400, "Deadline must be in YYYY-MM-DD format");
            }

            const [year, month, day] = deadline.split('-').map(Number);
            const parsedDate = new Date(deadline);

            const isValidDate = 
                parsedDate.getUTCFullYear() === year &&
                parsedDate.getUTCMonth() + 1 === month &&
                parsedDate.getUTCDate() === day;

            if (!isValidDate) {
                return sendError(res, 400, "Deadline is not a valid calendar date");
            }
        }
        
        const fields = {
            title: title?.trim(),
            status,
            description,
            urgency,
            deadline,
        };

    
        const updates = Object.entries(fields).filter(
            ([key, value]) => value !== undefined
        );

        if (updates.length === 0) {
            return sendError(res, 400, "No fields to update");
        }
        
        const setClause = updates
            .map(([key], index) => `${key} = $${index + 1}`)
            .join(', ');
        
        const values = updates.map(([, value]) => value);

        values.push(id);

        // Add user_id to query
        values.push(req.userId);

        const result = await pool.query(
            `UPDATE tasks
            SET ${setClause}
            WHERE id = $${values.length -1 }
            AND user_id = $${values.length}
            RETURNING *`,
            values
        );
        if (result.rowCount === 0) {
            return sendError(res, 404, "Task not found");
        }

        return res.status(200).json(result.rows[0]);
    }catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal server error');
    }
});


app.delete('/tasks/:id', authenticate, async (req, res) => {
    try{
        const id = Number(req.params.id);

        const result = await pool.query(`DELETE FROM tasks
                                         WHERE id = $1
                                         AND user_id = $2`, [id, req.userId]);

        if(result.rowCount === 0){
            return sendError(res, 404, 'Task not found');
        }
        return res.status(204).send();       
    }
    catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal server error');
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});