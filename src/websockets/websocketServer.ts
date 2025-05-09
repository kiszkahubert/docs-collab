import {Db, ObjectId} from "mongodb";
import WebSocket from "ws";
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

interface DocumentConnection{
    userId: ObjectId;
    ws: WebSocket;
}
interface DocumentUpdateMessage{
    type: 'document_update';
    data: any;
}
interface UserJoinedMessage{
    type: 'user_joined';
    data: {userId:string};
}
interface UserLeftMessage{
    type: 'user_left';
    data: {userId:string}
}
export class WebsocketServer{
    private wss: WebSocket.Server;
    private documentConnections: Map<string, DocumentConnection[]>;
    private db: Db;
    constructor(server: any, db: Db) {
        this.documentConnections = new Map();
        this.db = db;
        this.wss = new WebSocket.Server({
            noServer: true
        })
        server.on('upgrade',(request: any, socket: any, head: any) =>{
            this.handleUpgrade(request,socket,head)
        })
        this.wss.on('connection',(ws,request)=>{
            this.handleConnection(ws,request);
        })
    }
    private async handleUpgrade(request: any, socket: any, head: any){
        try{
            const cookies = parse(request.headers.cookie || '');
            const token = cookies.auth_token;
            if(!token){
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }
            jwt.verify(token,process.env.JWT_SECRET || "", (err: any, user: any)=>{
                if(err){
                    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
                    socket.destroy();
                    return;
                }
                request.user = user;
                const documentId = new URL(request.url, `http://${request.headers.host}`).searchParams.get('documentId');
                if(!documentId){
                    socket.write('HTTP/1.1 400 Bad Request \r\n\r\n');
                    socket.destroy();
                    return;
                }
                this.wss.handleUpgrade(request,socket,head,(ws) =>{
                    this.wss.emit('connection',ws, request);
                });
            });
        } catch (err){
            console.error(err);
            socket.destroy();
        }
    }
    private handleConnection(ws: WebSocket, request: any){
        try{
            const documentId = new URL(request.url, `http://${request.headers.host}`).searchParams.get('documentId');
            const userId = new ObjectId(request.user.userId);
            if(!documentId){
                ws.close(1008, 'no documentId')
                return;
            }
            this.addConnection(documentId, userId, ws);
            this.sendConnectedUsers(documentId, ws);
            ws.on('close', ()=>{
                this.removeConnection(documentId, userId, ws);
                this.notifyUserLeft(documentId, userId);
            });
            ws.on('message',(data)=>{
                this.handleClientMessage(documentId, userId, data.toString());
            })
            this.notifyUserJoined(documentId, userId);
            ws.on('error', (err)=>{
                console.error(err);
                this.removeConnection(documentId, userId, ws);
                this.notifyUserLeft(documentId,userId);
            })
        } catch(err){
            console.error(err);
            ws.close(1008,'asdsadsad')
        }
    }
    private addConnection(documentId: string, userId: ObjectId, ws: WebSocket){
        if(!this.documentConnections.has(documentId)){
            this.documentConnections.set(documentId, []);
        }
        const connections = this.documentConnections.get(documentId) || [];
        connections.push({userId,ws});
        this.documentConnections.set(documentId,connections);
        console.log(`${userId} connected to ${documentId}`);
    }
    private removeConnection(documentId: string, userId: ObjectId, ws: WebSocket){
        const connections = this.documentConnections.get(documentId);
        if(connections){
            const newConnections = connections.filter(con=>{
                !(con.userId.equals(userId) && con.ws === ws)
            });
            this.documentConnections.set(documentId,newConnections);
            console.log(`${userId} disconnected from ${documentId}`);
        }
    }
    private sendConnectedUsers(documentId: string, ws: WebSocket){
        const connections = this.documentConnections.get(documentId) || [];
        const users = connections.map(con => con.userId.toString());
        if(ws.readyState === WebSocket.OPEN){
            ws.send(JSON.stringify({
                type: 'initial_connection',
                data: {
                    documentId,
                    connectedUsers: users
                }
            }));
        }
    }
    public notifyDocumentUpdate(documentId: string, updatedDocument: any) {
        const connections = this.documentConnections.get(documentId) || [];
        connections.forEach(conn => {
            if (conn.ws.readyState === WebSocket.OPEN) {
                const message: DocumentUpdateMessage = {
                    type: 'document_update',
                    data: updatedDocument
                };
                conn.ws.send(JSON.stringify(message));
            }
        });
    }
    private notifyUserJoined(documentId: string, userId: ObjectId) {
        const connections = this.documentConnections.get(documentId) || [];
        connections.forEach(conn =>{
            if(!conn.userId.equals(userId) && conn.ws.readyState === WebSocket.OPEN){
                const message: UserJoinedMessage = {
                    type: 'user_joined',
                    data: {userId: userId.toString()}
                };
                conn.ws.send(JSON.stringify(message));
            }
        });
    }
    private notifyUserLeft(documentId: string, userId: ObjectId) {
        const connections = this.documentConnections.get(documentId) || [];
        connections.forEach(conn => {
            if (!conn.userId.equals(userId) && conn.ws.readyState === WebSocket.OPEN) {
                const message: UserLeftMessage = {
                    type: 'user_left',
                    data: {userId: userId.toString()}
                };
                conn.ws.send(JSON.stringify(message));
            }
        });
    }
    private handleClientMessage(documentId: string, userId: ObjectId, data: string) {
        try {
            const message = JSON.parse(data);
            if (message.type === 'content_update') {
                this.db.collection('documents').updateOne(
                    { _id: new ObjectId(documentId) },
                    {
                        $set: {
                            content: message.content,
                            title: message.title || 'Untitled',
                            updatedAt: new Date()
                        }
                    }
                ).then(() => {
                    const connections = this.documentConnections.get(documentId) || [];
                    connections.forEach(conn => {
                        if (conn.ws.readyState === WebSocket.OPEN) {
                            conn.ws.send(JSON.stringify({
                                type: 'content_update',
                                content: message.content,
                                title: message.title,
                                updatedBy: userId.toString()
                            }));
                        }
                    });
                }).catch(err => {
                    console.error(err);
                });
            }
        } catch (err) {
            console.error(err);
        }
    }
    public getConnectedUsers(documentId: string): string[] {
        const connections = this.documentConnections.get(documentId) || [];
        return connections.map(conn => conn.userId.toString());
    }
}