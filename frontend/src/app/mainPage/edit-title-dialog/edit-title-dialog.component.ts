import { Component, Inject } from '@angular/core';
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
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-edit-title-dialog',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle
  ],
  templateUrl: './edit-title-dialog.component.html',
  styleUrl: './edit-title-dialog.component.css'
})
export class EditTitleDialogComponent {
  titleControl = new FormControl('', [Validators.required]);
  constructor(
      public dialogRef: MatDialogRef<EditTitleDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: {documentId: string, currentTitle: string},
      private documentService: DocumentService,
      private snackBar: MatSnackBar
  ) {
    this.titleControl.setValue(this.data.currentTitle);
  }
  onCancel(): void {
    this.dialogRef.close();
  }
  onSave(): void {
    if (this.titleControl.valid && this.titleControl.value !== this.data.currentTitle) {
      this.documentService.updateDocument(
        this.data.documentId,
        '',
        this.titleControl.value || this.data.currentTitle
      ).subscribe({
        next: () => {
          this.snackBar.open('Tytuł został zaktualizowany!', 'OK', {duration: 2000});
          this.dialogRef.close(this.titleControl.value);
        },
        error: (err: any) => {
          this.snackBar.open("Błąd podczas aktualizacji tytułu", 'OK', {duration: 3000});
        }
      });
    } else {
      this.dialogRef.close();
    }
  }
}
