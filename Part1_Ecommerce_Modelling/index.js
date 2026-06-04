import express from 'express';
import dotenv from 'dotenv'

dotenv.config();

const app = express();

app.get('/' , (req , res) => {
    res.send('<h1>Hello World</h1>');
})


const port = process.env.PORT || 4000;

app.listen(port , () => {
    console.log(`Server is running on the port ${port}`);
});
