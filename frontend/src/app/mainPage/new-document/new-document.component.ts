import { Component } from '@angular/core';
import {ExistingDocumentComponent} from '../existing-document/existing-document.component';
import {DocumentService} from '../../services/document.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-new-document',
  imports: [
    ExistingDocumentComponent
  ],
  templateUrl: './new-document.component.html',
  styleUrl: './new-document.component.css'
})
export class NewDocumentComponent {
  constructor(private documentService: DocumentService, private router: Router){}
  createNewDocument(){
    this.documentService.createDocument().subscribe({
      next: newDoc => {
        console.log(newDoc);
        this.router.navigate(['/document',newDoc._id])
      },
      error: err => {
        console.error(err);
      }
    })
  }
}
