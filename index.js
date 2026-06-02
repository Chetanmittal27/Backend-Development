const express = require('express');
require('dotenv').config;

const app = express();

const port = 4000;

app.get('/' , (req , res) => {
    res.send('Hello World');
});

app.get('/email' , (req , res) => {
    res.send('chetanmittal@example.com');
})

app.get('/login' , (req , res) => {
    res.send('<h1>Please login at Backend Development</h1>');
})

app.get('/youtube' , (req , res) => {
    res.send('<h3>Delhi Technological University</h3>');
})

app.listen(process.env.PORT , () => {
    console.log(`App listening on port ${port}`);
})