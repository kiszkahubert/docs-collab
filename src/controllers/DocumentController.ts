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