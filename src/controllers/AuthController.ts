import {Request, Response} from 'express';
import {Db} from 'mongodb';
import bcrypt from 'bcryptjs';
import {createUser, getUserByEmail, User} from "../models/user";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res:Response) =>{
    try{
        const db: Db = req.app.locals.db;
        const newUser: User = req.body;
        newUser.password = await bcrypt.hash(newUser.password, 10);
        const createdUser = await createUser(db, newUser);
        res.status(201).json(createdUser);
    } catch (err){
        res.status(500).json({message:err});
    }
}

export const login = async (req: Request, res: Response)=>{
    try{
        const db: Db = req.app.locals.db;
        const { email, password } = req.body;
        const user = await getUserByEmail(db,email);
        if(user && await bcrypt.compare(password, user.password)){
            const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET || '', {expiresIn: '1h'});
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 3600000
            })
            res.json({success: true})
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch(err){
        res.status(500).json({message:err});
    }
}
export const logout = async (req: Request, res: Response) =>{
    res.clearCookie('auth_token');
    res.json({ success: true });
}