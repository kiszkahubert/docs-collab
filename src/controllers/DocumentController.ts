import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Db, ObjectId } from 'mongodb';
import { createDocument, getDocumentById, getDocumentsByUserId, updateDocument, deleteDocument } from '../models/Document';

export const createNewDocument: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try{
        const db: Db = req.app.locals.db;
        const userId = new ObjectId(req.user.userId);
        const newDocument = {
            title: req.body.title || "Nowy Dokument",
            content: req.body.content || "",
            userId: userId,
            sharedWith: [] as {userId: ObjectId, canEdit: boolean}[],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const createdDocument = await createDocument(db, newDocument);
        res.status(201).json(createdDocument);
    } catch (err){
        console.error(err);
        res.status(500).json({message:"Error creating document"});
    }
};

export const getDocument: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try{
        const db: Db = req.app.locals.db;
        const documentId = req.params.id;
        const document = await getDocumentById(db, documentId);
        if(!document) {
            res.status(404).json({message:"document not found"});
            return;
        }
        if(document.userId.toString() !== req.user.userId) {
            res.status(403).json({message:"you dont have access to this document"});
            return;
        }
        res.json(document);
    } catch (err){
        console.error(err);
        res.status(500).json({message:"error fetching document"});
    }
};

export const getUserDocuments: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try{
        const db: Db = req.app.locals.db;
        const userId = req.user.userId;
        const documents = await getDocumentsByUserId(db, userId);
        res.json(documents);
    } catch (err){
        console.error(err);
        res.status(500).json({message:"error fetching documents"});
    }
};

export const updateDocumentContent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try{
        const db: Db = req.app.locals.db;
        const documentId = req.params.id;
        const {content, title} = req.body;
        const document = await getDocumentById(db, documentId);
        if(!document) {
            res.status(404).json({message:"doc not found"});
            return;
        }
        if(document.userId.toString() !== req.user.userId) {
            res.status(403).json({message:"dont have access to edit this document"});
            return;
        }
        await updateDocument(db, documentId, content, title || document.title);
        res.json({success:true});
    } catch(err){
        console.error(err);
        res.status(500).json({message:"error updating the document"});
    }
};

export const deleteUserDocument: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try{
        const db: Db = req.app.locals.db;
        const documentId = req.params.id;
        const document = await getDocumentById(db, documentId);
        if(!document) {
            res.status(404).json({message:"doc not found"});
            return;
        }
        if(document.userId.toString() !== req.user.userId) {
            res.status(403).json({message:"no access to delete this document"});
            return;
        }
        await deleteDocument(db, documentId);
        res.json({success:true});
    } catch(err){
        console.error(err);
        res.status(500).json({message:"error deleting the document"});
    }
};

export const shareDocument: RequestHandler = async(req:Request, res:Response): Promise<void>=>{
    try{
        const db: Db = req.app.locals.db;
        const documentId = req.params.id;
        const {userId, canEdit} = req.body;
        const document = await getDocumentById(db, documentId);
        if(!document){
            res.status(404).json({message: "document not found"});
            return;
        }
        if(document.userId.toString() !== req.user.userId){
            res.status(403).json({message:"Only owner can share its document"});
            return;
        }
        if(document.sharedWith?.some((sw: {userId: ObjectId, canEdit: Boolean}) =>sw.userId.toString()===userId)){
            res.status(400).json({message:"user already has access"});
            return;
        }
        await db.collection<Document>('documents').updateOne(
            {_id: new ObjectId(documentId)},
            {$push: {sharedWith: {userId: new ObjectId(userId), canEdit: canEdit || false}}}
        );
        res.json({success: true});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "error sharing document"});
    }
}

export const revokeAccess: RequestHandler = async(req: Request, res: Response): Promise<void>=>{
    try{
        const db: Db = req.app.locals.db;
        const {id, userId} = req.params;
        const document = await getDocumentById(db,id);
        if(!document){
            res.status(404).json({message:"document not found"});
            return;
        }
        if(document.userId.toString()!==req.user.userId){
            res.status(403).json({message:"only owner can revoke access to its files"});
            return;
        }
        await db.collection<Document>('documents').updateOne(
            {_id: new ObjectId(id)},
            {$pull:{sharedWith:{userId: new ObjectId(userId)}}}
        );
        res.json({success:true})
    } catch(err){
        console.error(err);
        res.status(500).json({message: "error revoking access"});
    }
}

export const getDocumentSharedUsers: RequestHandler = async(req: Request, res: Response): Promise<void>=>{
    try{
        const db: Db = req.app.locals.db;
        const documentId = req.params.id;
        const document = await getDocumentById(db,documentId);
        if(!document){
            res.status(404).json({message: "Document not found"});
            return;
        }
        if(document.userId.toString()!==req.user.userId){
            res.status(403).json({message: "Only owner can see its shared users"});
            return;
        }
        res.json(document.sharedWith || []);
    } catch(err){
        console.error(err);
        res.status(500).json({message: "Error fetching shared users"});
    }
}