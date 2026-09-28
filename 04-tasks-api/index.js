import 'dotenv/config';

import express from 'express';    
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js'


const app = express();
const port = 3000;

app.use(express.json());

app.use(authRoutes);
app.use(taskRoutes);



app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});