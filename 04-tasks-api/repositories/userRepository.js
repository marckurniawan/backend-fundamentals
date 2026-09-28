import pool from "../db.js";

export const insertUserRepository = async (email, username, hashedPassword) => {
    const result = await pool.query(`INSERT INTO users (email, username, password)
                                    VALUES ($1, $2, $3)
                                    RETURNING id, username, email`,[email, username, hashedPassword]);
    return result.rows[0];
}

export const loginByUsername = async (identifier) =>{
    const result = await pool.query(
                    'SELECT id, password FROM users WHERE username = $1',
                    [identifier]
                );

    return result.rows[0];
}


export const loginByEmail = async (identifier) =>{
    const result = await pool.query(
                    'SELECT id, password FROM users WHERE email = $1',
                    [identifier]
                );
    return result.rows[0];
}