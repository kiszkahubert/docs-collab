import {Db, ObjectId} from "mongodb";
import {WebSocketServer} from "ws";
import jwt from "jsonwebtoken";

interface Client{
    ws: any;
    documentId: string;
    userId: string;
}
export function setupWebSocket(server: any, db: Db){
    const wss = new WebSocketServer({server});
    const clients: Client[] = [];
    wss.on('connection', (ws, req) => {
        const cookies = req.headers.cookie?.split(';').reduce((prev,current) => {
            const [name, value] = current.trim().split('=');
            prev[name] = value;
            return prev;
        }, {} as Record<string,string>);
        const token = cookies?.auth_token;
        if(!token){
            ws.close(1008, 'Unauthorized');
            return
        }
        let userId: string;
        try{
            const decoded = jwt.verify(token,process.env.JWT_SECRET || '') as {userId: string};
            userId = decoded.userId;
        } catch(err){
            ws.close(1008, 'Unauthorized');
            return;
        }
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const documentId = url.searchParams.get('documentId');
        if(!documentId){
            ws.close(1008, 'Document ID required')
            return;
        }
        const client: Client = {ws,documentId,userId};
        clients.push(client);
        ws.on('message',async (message: string) => {
            try{
                const data = JSON.parse(message);
                if(data.type === 'content-update'){
                    const docunent = await db.collection('documents').findOne({
                        _id: new ObjectId(documentId),
                        $or: [
                            {userId: new ObjectId(userId)},
                            {'sharedWith.userId': new ObjectId(userId)}
                        ]
                    });
                }
                if(!document){
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'no access to this document'
                    }));
                    return;
                }
                clients.forEach(client => {
                    if(client.documentId === documentId && client.userId !== userId){
                        client.ws.send(JSON.stringify({
                            type: 'content-update',
                            content: data.content,
                            sender: userId
                        }));
                    }
                });
                if(data.shouldSave){
                    await db.collection('documents').updateOne(
                        {_id: new ObjectId(documentId)},
                        {$set:{
                            content: data.content,
                            title: data.title || document.title,
                            updatedAt: new Date()
                        }}
                    );
                }
            } catch (err){
                console.error(err);
            }
        });
        ws.on('close', ()=>{
            const index = clients.findIndex(c => c.ws === ws);
            if(index !== -1){
                clients.splice(index, 1);
            }
        });
    });
    return wss;
}