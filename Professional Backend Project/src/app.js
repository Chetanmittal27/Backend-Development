import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));


// setting limit of how much json data should come from frontend
app.use(express.json({limit: "10kb"}));

// url encoding
app.use(express.urlencoded({extended: true , limit: "16kb"}));

// to store pdf, images etc in my server only my machine only
app.use(express.static("public"));

app.use(cookieParser());

export {app};
