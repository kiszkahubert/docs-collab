import express from 'express';
import { connectDB } from "./mongoClient";
import bodyParser from 'body-parser';
import authRoutes from "./routes/authRoutes";
import cookieParser from 'cookie-parser'
import cors from 'cors';
import documentRoutes from "./routes/documentRoutes";
import apiRoutes from "./routes/apiRoutes";
import dotenv from 'dotenv'
dotenv.config();
// require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}


const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}))



connectDB().then((db) =>{
    app.locals.db = db;
    app.use("/auth", authRoutes);
    app.use("/documents",documentRoutes);
    app.use("/api",apiRoutes);
    app.listen(3000, () => {
        console.log('server running');
    });
})



