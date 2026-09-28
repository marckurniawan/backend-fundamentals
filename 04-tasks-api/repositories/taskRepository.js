import pool from "../db.js";


const ALLOWED_UPDATE_FIELDS = new Set([
            'title',
            'status',
            'description',
            'urgency',
            'deadline'
        ]);

export const getAllTasksByUser = async (userId) => {
    const result = await pool.query(`SELECT * FROM tasks
                                         WHERE user_id = $1`,
                                         [userId]  
        );
    return result.rows;
}   

export const getTaskById = async (id, userId) => {
    const result = await pool.query(`SELECT * FROM tasks
                                     WHERE id = $1 AND user_id = $2`, [id, userId]);

    return result.rows[0];
}


export const insertTaskRepository = async (title, status, description, urgency, deadline, userId) => {
    const result = await pool.query(`INSERT INTO tasks 
                                     (title, status, description,         
                                     urgency, deadline, user_id)
                                     VALUES($1, $2, $3, $4, $5, $6)
                                     RETURNING *`, 
                                     [title, 
                                      status, 
                                      description, 
                                      urgency, 
                                      deadline,
                                      userId]);
    return result.rows[0];  
                            
}

export const updateTaskRepository = async (id, userId, updates) =>{
    

    const safeUpdates = updates.filter(([key]) =>
        ALLOWED_UPDATE_FIELDS.has(key)
    );

    if (safeUpdates.length === 0) {
        throw new Error('No fields to update');
    }

    const setClause = safeUpdates.map(([key], index) => `${key} = $${index + 1}`).join(', ');

    const values = safeUpdates.map(([, value]) => value);
    values.push(id, userId);

    const result = await pool.query(
            `UPDATE tasks
            SET ${setClause}
            WHERE id = $${values.length -1 }
            AND user_id = $${values.length}
            RETURNING *`,
            values
        );
    return result.rows[0];
}

export const deleteTaskRepository = async (id, userId) => {
    const result = await pool.query(`DELETE FROM tasks
                                         WHERE id = $1
                                         AND user_id = $2`, [id, userId]);

    return result.rowCount > 0;
}
