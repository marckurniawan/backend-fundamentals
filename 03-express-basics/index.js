import express from 'express'

const app = express();
const port = 3000;



const myLogger = function (req, res, next) {
    console.log(`${req.method} ${req.path}`);
    next();
}

app.use(myLogger);


app.get('/', (req, res) => {
    res.send(`Hello from Express!`);
})

app.get('/broken', (req, res) => {
    throw new Error('Something went wrong!');
});

app.get('/greet/:name', (req, res) => {
    res.send(`Hello ${req.params.name}`);
})

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: err.message });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})


