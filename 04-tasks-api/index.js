import pool from './db.js';
import express from 'express';    

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

app.get('/tasks', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM tasks');
        return res.json(result.rows);
    }
    catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal server error');
    }
}); 

// Create
app.post('/tasks', async (req, res) => {
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
            `INSERT INTO tasks (title, status, description, urgency, deadline) 
            VALUES($1, $2, $3, $4, $5) 
            RETURNING *`,
        [title.trim(), 
         taskStatus, 
         description ?? '-', 
         taskUrgency, 
         deadline ?? null]);
        

        return res.status(201).json(result.rows[0]);
    }
    catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal Server Error');
    }
});

// Read
app.get('/tasks/:id', async (req, res) => {
    try{
        const id = Number(req.params.id);
        
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
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

app.patch('/tasks/:id', async (req, res) =>{
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
            title: title !== undefined ? title.trim() : undefined,
            status,
            description,
            urgency,
            deadline
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

        const result = await pool.query(
            `UPDATE tasks
            SET ${setClause}
            WHERE id = $${values.length}
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


app.delete('/tasks/:id', async (req, res) => {
    try{
        const id = Number(req.params.id);

        const result = await pool.query(`DELETE FROM tasks
                                WHERE id = $1`, [id]);

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