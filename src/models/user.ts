import {Db, ObjectId} from 'mongodb';

export interface User{
    _id?: ObjectId;
    name: string;
    surname: string;
    email: string;
    password: string;
}

export const createUser = async (db: Db, user: User)=>{
    const usersCollection = db.collection("users");
    const result = await usersCollection.insertOne(user);
    return { _id: result.insertedId, ...user};
}

export const getUserByEmail = async(db:Db, email: string) =>{
    const userCollection = db.collection("users");
    return await userCollection.findOne({email});
}
