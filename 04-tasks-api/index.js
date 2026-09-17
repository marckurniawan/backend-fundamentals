import express from 'express';    

const app = express();
const port = 3000;

app.use(express.json());

const tasks = [];
let counter = 1;

const allowedUrgencies = ['low', 'medium', 'high'];
const allowedStatuses = ['pending', 'in-progress', 'completed'];

const sendError = (res, statusCode, message) => {
    return res.status(statusCode).json({
        error: message
    });
};

app.get('/tasks', (req, res) => {
    res.json(tasks);
});

// Create
app.post('/tasks', (req, res) => {
    const {title, status, urgency} = req.body;

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
    
    const newTask = {
        id: counter,
        title: title.trim(),
        status: taskStatus,
        description: req.body.description ?? '-',
        urgency: taskUrgency,
        deadline: req.body.deadline ?? null
    }
    tasks.push(newTask);
    counter++;
    

    res.status(201).json(newTask);
});

// Read
app.get('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    
    const task = tasks.find((task) => task.id === id);

    if(!task){
        return sendError(res, 404, "Task not Found");
    }


    res.json(task);
});

app.patch('/tasks/:id', (req, res) =>{
    const id = Number(req.params.id);
    
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if(taskIndex === -1){
        return sendError(res, 404, "Task not Found");

    }

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
            return res.status(400).json({
                error: "Status must be pending, in-progress, or completed"
            });
       }
    
    const updatedTask = {
        ...tasks[taskIndex],

        ...(title !== undefined && {
            title: title.trim()
        }),

        ...(status !== undefined && {
            status
        }),

        ...(description !== undefined && {
            description
        }),

        ...(urgency !== undefined && {
            urgency
        }),

        ...(deadline !== undefined && {
            deadline
        })
    };

    tasks[taskIndex] = updatedTask;

    return res.json(updatedTask);
});


app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);

    const taskIndex = tasks.findIndex((task) => task.id === id);

    if(taskIndex === -1){
        return sendError(res, 404, 'Task not found');
    }

    tasks.splice(taskIndex, 1);

    res.status(204).send();
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});