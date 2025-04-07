import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface Document{
  _id?: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService{
  private apiUrl = 'http://localhost:3000/documents';
  constructor(private http: HttpClient){}
  getUserDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl)
  }
  getDocument(id: string): Observable<Document>{
    return this.http.get<Document>(`${this.apiUrl}/${id}`)
  }
  createDocument(title?: string, content?: string): Observable<Document>{
    return this.http.post<Document>(this.apiUrl, {title, content});
  }
  updateDocument(id: string, content: string, title: string): Observable<any>{
    return this.http.put(`${this.apiUrl}/${id}`,{content, title});
  }
  deleteDocument(id: string): Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  shareDocument(documentId: string, email: string, canEdit: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/${documentId}/share`, {
      email,
      canEdit
    });
  }
  getSharedUsers(documentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${documentId}/shared`);
  }
  revokeAccess(documentId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${documentId}/share/${userId}`);
  }
}
