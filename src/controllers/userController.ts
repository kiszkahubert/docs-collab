import { Request, Response } from "express";
import { Db } from "mongodb";
import { createUser, getUserByEmail } from "../models/user";


export const getUser = async (req: Request, res: Response) => {
    try {
        const db: Db = req.app.locals.db;
        const userId = req.params.id;
        const user = await getUserByEmail(db, userId);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err });
    }
};

export const addUser = async (req: Request, res: Response) => {
    try {
        const db: Db = req.app.locals.db;
        const newUser = req.body;
        const createdUser = await createUser(db, newUser);
        res.status(201).json(createdUser);
    } catch (err) {
        res.status(500).json({ message: err });
    }
};