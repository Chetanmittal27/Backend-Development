import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

import dotenv from "dotenv";
dotenv.config();


async function connectDB(){
    try{
        const response = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MONGODB Connected || DB HOSTS: ${response.connection.host}`);
    }
    catch(err){
        console.log("MONGODB Connection Error: " , err);
    }
}


export default connectDB;