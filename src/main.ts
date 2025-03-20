import express, { Request, Response } from 'express';
import { connectDB } from "./mongoClient";
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import authRoutes from "./routes/authRoutes";
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

export const verifyToken = (req: Request, res: Response, next: () => void) =>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET || "", (err: any, user: any) => {
        if (err){
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

connectDB().then((db) =>{
    app.locals.db = db;
    app.use("/auth", authRoutes);

    app.listen(3000, () => {
        console.log('server running');
    });
})



