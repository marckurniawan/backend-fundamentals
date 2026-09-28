import express from 'express';
import authenticate from '../middleware/authenticate.js';
import { getTasks, getTask, insertTask, updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.get('/tasks', authenticate, getTasks);

router.get('/tasks/:id', authenticate, getTask);

router.post('/tasks', authenticate, insertTask);

router.patch('/tasks/:id', authenticate, updateTask);

router.delete('/tasks/:id', authenticate, deleteTask);

export default router;