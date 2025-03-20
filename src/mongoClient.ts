import {MongoClient} from 'mongodb';

const uri = "mongodb://root:root@localhost:27017/dochub?authSource=admin";
const client = new MongoClient(uri);

export async function connectDB(){
    try{
        await client.connect();
        return client.db("dochub");
    } catch(err){
        console.error(err);
    }
}

export { client };