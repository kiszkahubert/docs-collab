import express from 'express';
import { connectDB } from "./mongoClient";
import bodyParser from 'body-parser';
import authRoutes from "./routes/authRoutes";
import cookieParser from 'cookie-parser'
import cors from 'cors';
import documentRoutes from "./routes/documentRoutes";
import apiRoutes from "./routes/apiRoutes";
import {createServer} from "node:http";
import {WebsocketServer} from "./websockets/websocketServer";
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
    const server = createServer(app);
    const wsServer = new WebsocketServer(server, db!)
    app.locals.wsServer = wsServer;
    app.set('wsServer',wsServer);
    app.use("/auth", authRoutes);
    app.use("/documents",documentRoutes);
    app.use("/api",apiRoutes);
    server.listen(3000, () => {
        console.log('server running');
    });
})