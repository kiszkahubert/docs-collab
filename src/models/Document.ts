import {Db, ObjectId} from "mongodb";

export interface Document{
    _id?: ObjectId;
    title: string
    content: string
    userId: ObjectId;
    sharedWith: {
        userId: ObjectId,
        canEdit: boolean
    }[],
    createdAt: Date;
    updatedAt: Date
}

export const createDocument = async (db: Db, document: Document)=>{
    const documentsCollection = db.collection("documents");
    const result = await documentsCollection.insertOne(document);
    return {_id: result.insertedId, ...document };
}
export const getDocumentById = async (db: Db, id: string)=>{
    const documentsCollection = db.collection("documents");
    return await documentsCollection.findOne({_id: new ObjectId(id)});
}
export const getDocumentsByUserId = async (db: Db, userId:string)=>{
    const documentsCollection = db.collection("documents");
    return await documentsCollection.find({userId: new ObjectId(userId)}).toArray();
}
export const updateDocument = async(db:Db, id: string, content: string, title: string) =>{
    const documentsCollection = db.collection("documents");
    return await documentsCollection.updateOne(
        {_id: new ObjectId(id)},
        {
            $set: {
                content: content,
                title: title,
                updatedAt: new Date()
            }
        });
}
export const deleteDocument = async(db: Db, id: string)=>{
    const documentsCollection = db.collection("documents");
    return await documentsCollection.deleteOne({_id: new ObjectId(id)});
}