import {Component, Inject} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {DocumentService} from '../../services/document.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-share-document-dialog',
  imports: [
    MatFormFieldModule,
    MatDialogTitle,
    MatDialogContent,
    MatInputModule,
    MatCheckboxModule,
    MatDialogActions,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './share-document-dialog.component.html',
  styleUrl: './share-document-dialog.component.css'
})
export class ShareDocumentDialogComponent {
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  constructor(
    public dialogRef: MatDialogRef<ShareDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {documentId:string},
    private documentService: DocumentService,
    private snackBar: MatSnackBar
  ){}
  onCancel(): void{
    this.dialogRef.close();
  }
  onShare(): void{
    if(this.emailControl.valid){
      this.documentService.shareDocument(this.data.documentId,this.emailControl.value!,true)
        .subscribe({
          next: ()=>{
            this.snackBar.open('Dokument został udostępniony!','OK',{duration:2000});
            this.dialogRef.close(true);
          },
          error: (err: any)=>{
            this.snackBar.open("Błąd " + err.error.message,'OK',{duration:3000});
          }
        })
    }
  }
}
