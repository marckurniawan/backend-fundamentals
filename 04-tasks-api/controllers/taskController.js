import pool from '../db.js';
import { getAllTasksByUser, getTaskById, insertTaskRepository, updateTaskRepository, deleteTaskRepository } from '../repositories/taskRepository.js';
import sendError from '../utils/sendError.js';
import {
    validateTitle,
    validateUrgency,
    validateStatus,
    validateDeadline
} from '../utils/validators.js';

export const getTasks = async (req, res) => {
    try{
        const result = await getAllTasksByUser(req.userId);

        return res.json(result);
    }
    catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal Server Error');
    }
};

export const getTask = async (req, res) => {
    try{
        const result = await getTaskById(Number(req.params.id), req.userId);

        if (!result) {
            return sendError(res, 404, 'Task not found');
        }
        return res.json(result);
    }
    catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal Server Error');
    }
}

export const insertTask = async (req, res) => {
    try{
        const {title, status, description, deadline,  urgency} = req.body;
        
        if(title === undefined){
            return sendError(res, 400, 'Title is required');
        }
        const titleValidation = validateTitle(title);

        if (!titleValidation.valid) {
            return sendError(res, 400, titleValidation.message);
        }

        const urgencyValidation = validateUrgency(urgency);

        if (!urgencyValidation.valid) {
            return sendError(res, 400, urgencyValidation.message);
        }

        const statusValidation = validateStatus(status);

        if (!statusValidation.valid) {
            return sendError(res, 400, statusValidation.message);
        }

        const deadlineValidation = validateDeadline(deadline);

        if (!deadlineValidation.valid) {
            return sendError(res, 400, deadlineValidation.message);
        }

        const result = await insertTaskRepository(
            title,
            status ?? 'pending',
            description ?? '-',
            urgency ?? 'medium',
            deadline ?? null,
            req.userId
        );

        return res.status(201).json(result);
    }
    catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal Server Error');
    }
}

export const updateTask = async (req, res) => {
    try{
        const id = Number(req.params.id);

        const  {title, status, description, urgency, deadline} = req.body;

        const titleValidation = validateTitle(title);
        if (!titleValidation.valid) {
            return sendError(res, 400, titleValidation.message);
        }
    
        const urgencyValidation = validateUrgency(urgency);

        if (!urgencyValidation.valid) {
            return sendError(res, 400, urgencyValidation.message);
        }

        const statusValidation = validateStatus(status);

        if (!statusValidation.valid) {
            return sendError(res, 400, statusValidation.message);
        }

        const deadlineValidation = validateDeadline(deadline);

        if (!deadlineValidation.valid) {
            return sendError(res, 400, deadlineValidation.message);
        }

        const fields = {
            title: title?.trim(),
            status,
            description,
            urgency,
            deadline
        }

        const updates = Object.entries(fields).filter(
            ([key, value]) => value !== undefined
        );

        if(updates.length === 0){
            return sendError(res, 400, 'No Fields to Update');
        }

        const result = await updateTaskRepository(id, req.userId, updates);

        if (!result) {
            return sendError(res, 404, 'Task not found');
        } 

        return res.status(200).json(result);
    }
    catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal Server Error');
    }
}


export const deleteTask = async (req, res) => {
    try{

        const result = await deleteTaskRepository(Number(req.params.id), req.userId);

        if(!result){
            return sendError(res, 404, 'Task not found');
        }
        return res.status(204).send();       
    }
    catch(error){
        console.error(`Error: ${error.message}`);
        return sendError(res, 500, 'Internal server error');
    }
}