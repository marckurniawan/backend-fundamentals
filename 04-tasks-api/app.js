import express from 'express';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(express.json());

app.use(authRoutes);
app.use(taskRoutes);

export default app;