import {MongoClient} from 'mongodb';

const uri = "mongodb://localhost:27017/DocHub";
const client = new MongoClient(uri);

export async function connectDB(){
    try{
        await client.connect();
        return client.db("DocHub");
    } catch(err){
        console.error(err);
    }
}

export { client };