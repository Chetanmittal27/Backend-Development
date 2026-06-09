import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({
    path: './env'
});


import express from 'express';
const app = express();

import connectDB from "./db/index.js";

/*
async function connectDB(){
    try{
        const response = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        app.on((error) => {
            console.log("ERROR: " , error);
            throw error;
        })

        app.listen(process.env.PORT , () => {
            console.log(`App is listening on the port ${process.env.PORT}`);
        });
    }    
    catch(error){
        console.log("ERROR: " , error);
        throw error;
    }
}
*/

connectDB();