import express, {NextFunction, Request, Response} from 'express';
import { connectDB } from "./mongoClient";
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import authRoutes from "./routes/authRoutes";
import cookieParser from 'cookie-parser'
import cors from 'cors';
import documentRoutes from "./routes/documentRoutes";
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

export const verifyToken = (req: Request, res: Response, next: ()=>void): void => {
    const token = req.cookies.auth_token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
    if(token == null)  res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET || "", (err: any, user: any) => {
        if (err){
            res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

connectDB().then((db) =>{
    app.locals.db = db;
    app.use("/auth", authRoutes);
    app.use("/documents",documentRoutes);
    app.listen(3000, () => {
        console.log('server running');
    });
})



