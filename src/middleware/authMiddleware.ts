import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
    if(token == null)  return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET || "", (err: any, user: any) => {
        if (err){
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}