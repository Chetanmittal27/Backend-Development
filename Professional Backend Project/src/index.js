import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({
    path: './env'
});


import express from 'express';
import { app } from "./app.js";

import connectDB from "./db/index.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`App is running on the port ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Database Connection Failed: ", error);
});


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

// connectDB();