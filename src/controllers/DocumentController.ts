import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Db, ObjectId } from 'mongodb';
import { createDocument, getDocumentById, getDocumentsByUserId, updateDocument, deleteDocument } from '../models/Document';

interface sharedWith{userId: ObjectId, canEdit: Boolean}

export const createNewDocument: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try{
        const db: Db = req.app.locals.db;
        const wsServer = req.app.locals.wsServer;
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
        if(wsServer){
            wsServer.notifyDocumentUpdate(createdDocument._id.toString(), createdDocument);
        }
        res.status(201).json(createdDocument);
    } catch (err){
        res.status(500).json({message:"Błąd podczas tworzenia dokumentu"});
    }
};

export const getDocument: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try{
        const db: Db = req.app.locals.db;
        const wsServer = req.app.locals.wsServer;
        const documentId = req.params.id;
        const document = await getDocumentById(db, documentId);
        if(!document) {
            res.status(404).json({message:"document not found"});
            return;
        }
        if(document.userId.toString() !== req.user.userId && !document.sharedWith?.some((sw: sharedWith)=>sw.userId.toString() === req.user.userId)) {
            res.status(403).json({message:"you dont have access to this document"});
            return;
        }
        if(wsServer){
            wsServer.notifyUserJoined(documentId, new ObjectId(req.user.userId));
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
        res.status(500).json({message:"Problem w pozyskaniu dokumentów"});
    }
};

export const updateDocumentContent: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try{
        const db: Db = req.app.locals.db;
        const wsServer = req.app.locals.wsServer;
        const documentId = req.params.id;
        const {content, title} = req.body;
        const document = await getDocumentById(db, documentId);
        if(!document) {
            res.status(404).json({message:"Dokument nie został znaleziony"});
            return;
        }
        if(document.userId.toString() !== req.user.userId ) {
            const sharedAccess = document.sharedWith?.find((sw: sharedWith)=>sw.userId.toString() === req.user.userId)
            if(!sharedAccess || !sharedAccess.canEdit){
                res.status(403).json({message:"Nie masz dostępu do tego dokumentu"});
                return;
            }
        }
        await updateDocument(db, documentId, content, title || document.title);
        const updatedDoc = await getDocumentsByUserId(db,documentId);
        if(wsServer && updatedDoc){
            wsServer.notifyDocumentUpdate(documentId, updatedDoc);
        }
        res.json({success:true});
    } catch(err){
        console.error(err);
        res.status(500).json({message:"Błąd podczas aktualizacji dokumentu"});
    }
};

export const deleteUserDocument: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try{
        const db: Db = req.app.locals.db;
        const documentId = req.params.id;
        const document = await getDocumentById(db, documentId);
        if(!document) {
            res.status(404).json({message:"Dokument nie znaleziony"});
            return;
        }
        if(document.userId.toString() !== req.user.userId) {
            res.status(403).json({message:"Nie masz uprawnień aby usunąć ten dokument"});
            return;
        }
        await deleteDocument(db, documentId);
        res.json({success:true});
    } catch(err){
        console.error(err);
        res.status(500).json({message:"Bład podczas usuwania dokumentu"});
    }
};

export const shareDocument: RequestHandler = async(req:Request, res:Response): Promise<void>=>{
    try{
        const db: Db = req.app.locals.db;
        const documentId = req.params.id;
        const { email, canEdit } = req.body;
        const user = await db.collection('users').findOne({ email });
        if(!user){
            res.status(404).json({message: "Użytkownik nie znaleziony"});
            return;
        }
        const document = await getDocumentById(db, documentId);
        if(!document){
            res.status(404).json({message: "Dokument nie znaleziony"});
            return;
        }
        if(document.userId.toString() !== req.user.userId){
            res.status(403).json({message:"Tylko właścicieł może udostępnić swój dokument"});
            return;
        }
        if(document.sharedWith?.some((sw: sharedWith) => sw.userId.toString() === user._id.toString())){
            res.status(400).json({message:"Użytkownik ma już dostęp"});
            return;
        }
        await db.collection<Document>('documents').updateOne(
            {_id: new ObjectId(documentId)},
            {$push: {sharedWith: {userId: user._id, canEdit: canEdit || false}}}
        );
        res.json({success: true});
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Problem w udostępnieniu dokumentu"});
    }
}
export const revokeAccess: RequestHandler = async(req: Request, res: Response): Promise<void>=>{
    try{
        const db: Db = req.app.locals.db;
        const {id, userId} = req.params;
        const document = await getDocumentById(db,id);
        if(!document){
            res.status(404).json({message:"Dokument nie znaleziony"});
            return;
        }
        if(document.userId.toString()!==req.user.userId){
            res.status(403).json({message:"Tylko użytkownik może usunąć dostęp do dokumentu"});
            return;
        }
        await db.collection<Document>('documents').updateOne(
            {_id: new ObjectId(id)},
            {$pull:{sharedWith:{userId: new ObjectId(userId)}}}
        );
        res.json({success:true})
    } catch(err){
        console.error(err);
        res.status(500).json({message: "Problem podczas usuwania dostępu"});
    }
}

export const getDocumentSharedUsers: RequestHandler = async(req: Request, res: Response): Promise<void>=>{
    try{
        const db: Db = req.app.locals.db;
        const documentId = req.params.id;
        const document = await getDocumentById(db,documentId);
        if(!document){
            res.status(404).json({message: "Dokument nie znaleziony"});
            return;
        }
        if(document.userId.toString()!==req.user.userId){
            res.status(403).json({message: "Tylko użytkownik może zobaczyć użytkowników z dostępem do dokumentu"});
            return;
        }
        res.json(document.sharedWith || []);
    } catch(err){
        console.error(err);
        res.status(500).json({message: "Problem z dostępem do dokumentów"});
    }
}