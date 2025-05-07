import express from 'express';
import { connectDB } from "./mongoClient";
import bodyParser from 'body-parser';
import authRoutes from "./routes/authRoutes";
import cookieParser from 'cookie-parser'
import cors from 'cors';
import documentRoutes from "./routes/documentRoutes";
import apiRoutes from "./routes/apiRoutes";
import {Db} from "mongodb";
import {setupWebSocket} from "./websockets/websocket";
require('dotenv').config();
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
    const server = app.listen(3000, () => {
        console.log('server running');
    });
    setupWebSocket(server,db!);
})



