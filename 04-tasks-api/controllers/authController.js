import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { insertUserRepository, loginByEmail, loginByUsername } from "../repositories/userRepository.js"; 
import sendError from "../utils/sendError.js";
import { validateEmail, validatePassword, validateUsername } from "../utils/validators.js";


export const insertUser =  async (req, res) => {
    try{
        const {email, username, password} = req.body;
        
        if(email === undefined){
            return sendError(res, 400, 'Email is required');
        }
        const emailValidation = validateEmail(email);
        if(!emailValidation.valid){
            return sendError(res, 400, emailValidation.message);
        }
        
        if(username === undefined){
            return sendError(res, 400, 'Username is required');
        }
        const usernameValidation = validateUsername(username);
        if(!usernameValidation.valid){
            return sendError(res, 400, usernameValidation.message);
        }

        if(password === undefined){
            return sendError(res, 400, 'Password is required');
        }
        const passwordValidation = validatePassword(password);
        if(!passwordValidation.valid){
            return sendError(res, 400, passwordValidation.message);
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await insertUserRepository(email, username, hashedPassword);

        return res.status(201).json(result);
    }
    catch(error){
        if(error.code === '23505'){
            return sendError(res, 409, 'Email or username has been used');
        }
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal server error');
    }
}


export const loginUser = async (req, res) =>{
    try {
        const { identifier, password } = req.body;

        if (
            typeof identifier !== 'string' || typeof password !== 'string' ||
            !identifier.trim() || !password.trim()){

            return sendError(res, 400, "Email/username and password are required")
        }
        let user;

        if(identifier.includes('@')){
            user = await loginByEmail(identifier);
        }
        else{
            user = await loginByUsername(identifier);
        }

        if (!user) {
            return sendError(res, 401, 'Wrong email or password');
        }


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
}