import {Component, OnInit} from '@angular/core';
import {ExistingDocumentComponent} from '../existing-document/existing-document.component';
import {Document, DocumentService} from '../../services/document.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-new-document',
  imports: [
    ExistingDocumentComponent
  ],
  templateUrl: './new-document.component.html',
  styleUrl: './new-document.component.css'
})
export class NewDocumentComponent implements OnInit{
  documents: Document[] = [];
  constructor(private documentService: DocumentService, private router: Router){}
  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments(): void{
    this.documentService.getUserDocuments().subscribe({
      next: data =>{
        this.documents = data;
      },
      error: err => {
        console.error(err);
      }
    })
  }
  createNewDocument(){
    this.documentService.createDocument().subscribe({
      next: newDoc => {
        this.router.navigate(['/document',newDoc._id])
      },
      error: err => {
        console.error(err);
      }
    })
  }
  onDocumentDeleted(documentId:string):void{
    this.documents = this.documents.filter(doc=> doc._id !== documentId);
  }
}
