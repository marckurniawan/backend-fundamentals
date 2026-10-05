import express from 'express';
import {authenticate } from '../middleware/authenticate.js';
import { validateIdParam } from '../middleware/validateIdParam.js';
import { getTasks, getTask, insertTask, updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.get('/tasks', authenticate, getTasks);

router.get('/tasks/:id', authenticate, validateIdParam, getTask);

router.post('/tasks', authenticate, insertTask);

router.patch('/tasks/:id', authenticate, validateIdParam, updateTask);

router.delete('/tasks/:id', authenticate, validateIdParam, deleteTask);

export default router;