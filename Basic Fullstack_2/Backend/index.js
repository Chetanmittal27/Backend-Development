import express from 'express';
import dotenv from 'dotenv'

dotenv.config();

const app = express();

app.get('/' , (req , res) => {
    res.send('Server is Ready');
});


app.get('/api/jokes' , (req , res) => {

    const Jokes = [
        {
            id: 1,
            title: 'A joke',
            desc: 'This is a joke'
        },

        {
            id: 2,
            title: 'Another joke',
            desc: 'This is another joke'
        },

        {
            id: 3,
            title: 'Third Joke',
            desc: 'This is a third joke'
        },

        {
            id: 4,
            title: 'Fourth Joke',
            desc: 'This is a fourth joke'
        },

        {
            id: 5,
            title: 'Fifth Joke',
            desc: 'This is a fifth joke'
        }
    ];

    res.send(Jokes);
});

const port = process.env.PORT || 3000;

app.listen(port , () => {
    console.log(`Server listen at port ${port}`);
});