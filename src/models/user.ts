import {client} from '../pgClient';

export interface User{
    id: number,
    email: string,
    password: string
    name: string,
    surname: string
}

export async function getUserByEmail(email: string): Promise<User | null>{
    try{
        const res = await client.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );
        if(res.rows.length == 0) return null;
        return res.rows[0] as User;
    } catch(err){
        console.error(err);
        throw new Error("Func getUserByEmail failed");
    }
    
}