import {Request, Response} from 'express';
import {Db} from 'mongodb';
import bcrypt from 'bcryptjs';
import {createUser, getUserByEmail, User} from "../models/User";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res:Response) =>{
    try{
        const db: Db = req.app.locals.db;
        const newUser: User = req.body;
        const existingUser = await getUserByEmail(db,newUser.email);
        if (!newUser.email?.trim() || !newUser.password?.trim() || !newUser.name?.trim() || !newUser.surname?.trim()) {
            return res.status(400).json({ message: 'Wszystkie pola muszą być wypełnione' });
        }
        if(existingUser){
            return res.status(409).json({ message: 'Użytkownik z takim adresem email już istnieje' });
        }
        if(newUser.email.length < 6 || newUser.email.length > 30){
            return res.status(409).json({ message: 'Email musi mieć 6-20 znaków' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(newUser.email)){
            return res.status(409).json({ message: 'Email musi być poprawny' });
        }
        if(newUser.password.length < 6 || newUser.password.length > 30){
            return res.status(409).json({ message: 'Hasło musi mieć 6-20 znaków' });
        }
        if(newUser.name.length < 6 || newUser.name.length > 30){
            return res.status(409).json({ message: 'Imię musi mieć 6-20 znaków' });
        }
        if(newUser.surname.length < 6 || newUser.surname.length > 30){
            return res.status(409).json({ message: 'Nazwisko musi mieć 6-20 znaków' });
        }
        newUser.password = await bcrypt.hash(newUser.password, 10);
        const createdUser = await createUser(db, newUser);
        res.status(201).json(createdUser);
    } catch (err){
        console.log(err);
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
            console.error("ERROR2")
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch(err){
        console.error("ERROR1",err)
        res.status(500).json({message:err});
    }
}
export const logout = async (req: Request, res: Response) =>{
    res.clearCookie('auth_token');
    res.json({ success: true });
}