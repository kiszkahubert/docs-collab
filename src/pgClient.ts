import { Client } from 'pg';

export const client = new Client({
    user: 'postgres',
    password: 'root',
    host: 'localhost',
    port: 5432,
    database: 'DocHub'
});

client.connect().then(()=>{
    console.log("connected")
})
.catch((err) =>{
    console.log(err)
});