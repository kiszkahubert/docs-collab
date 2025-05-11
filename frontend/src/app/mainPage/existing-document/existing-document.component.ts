import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Document, DocumentService} from '../../services/document.service';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import {MatDialog} from '@angular/material/dialog';
import {ShareDocumentDialogComponent} from '../share-document-dialog/share-document-dialog.component';
import {MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EditTitleDialogComponent} from '../edit-title-dialog/edit-title-dialog.component';
import {PreviewService} from '../../services/preview.service';


@Component({
  selector: 'app-existing-document',
  imports: [CommonModule, MatMenuModule, MatIconButton,MatIconModule],
  templateUrl: './existing-document.component.html',
  styleUrl: './existing-document.component.css'
})
export class ExistingDocumentComponent implements OnInit{
  previewImage: string = '';
  @Input() currentUserId!: string;
  @Input() document!: Document;
  @Output() documentDeleted = new EventEmitter<string>();
  @Output() documentUpdated = new EventEmitter<Document>();
  constructor(private router: Router,
              private documentService: DocumentService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private previewService: PreviewService
  ){}
  ngOnInit() {
    this.generatePreview()
  }

  openDocument(): void{
    this.router.navigate(['/document',this.document._id])
  }
  openShareDialog(event: MouseEvent): void{
    event.stopPropagation();
    const dialogRef = this.dialog.open(ShareDocumentDialogComponent, {
      width: '400px',
      data: {documentId: this.document._id}
    });
  }
  deleteDocument(event: MouseEvent): void{
    event.stopPropagation();
    this.documentService.deleteDocument(this.document._id!).subscribe({
      next: () => {
        this.snackBar.open('Document has been deleted', 'OK', {duration: 2000});
        this.documentDeleted.emit(this.document._id);
      },
      error: (err) => {
        this.snackBar.open('Error deleting document', 'OK', {duration: 3000});
      }
    });
  }
  changeDocumentTitle(event: MouseEvent): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(EditTitleDialogComponent, {
      width: '400px',
      data: {
        documentId: this.document._id,
        currentTitle: this.document.title
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedDoc = {...this.document, title: result};
        this.document = updatedDoc;
        this.documentUpdated.emit(updatedDoc);
      }
    });
  }
  generatePreview() {
    this.previewImage = this.previewService.generateTextPreview(this.document.content);
  }
}
