import express from 'express';
import { insertUser, loginUser } from '../controllers/authController.js';

const router = express.Router();


router.post('/register', insertUser);

router.post('/login', loginUser);

export default router;