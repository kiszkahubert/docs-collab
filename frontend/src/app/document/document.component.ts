import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {QuillEditorComponent, QuillModule} from 'ngx-quill';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DocumentService} from '../services/document.service';

@Component({
  selector: 'app-document',
  imports: [QuillModule, FormsModule, ReactiveFormsModule],
  templateUrl: './document.component.html',
  styleUrl: './document.component.css'
})
export class DocumentComponent implements OnInit, OnDestroy{
  documentId: string = '';
  editorContent: string = '';
  titleControl = new FormControl('Nowy dokument');
  private contentChangeSub: Subscription | undefined;
  private titleChangeSub: Subscription | undefined;
  private saveInProgress = false;
  constructor(private route: ActivatedRoute, private documentService: DocumentService) {}
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.documentId = params['id'];
      if(this.documentId) this.loadDocument();
    });
    this.contentChangeSub = new FormControl(this.editorContent)
      .valueChanges
      .pipe(debounceTime(2000))
      .subscribe(()=>{
        if(this.documentId && !this.saveInProgress) this.saveDocument();
      });
    this.titleChangeSub = this.titleControl.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(()=>{
        if(this.documentId && !this.saveInProgress) this.saveDocument();
      })
  }
  ngOnDestroy() {
    if(this.contentChangeSub) this.contentChangeSub.unsubscribe();
    if(this.titleChangeSub) this.titleChangeSub.unsubscribe();
  }
  loadDocument(){
    this.documentService.getDocument(this.documentId).subscribe(
      document => {
        this.editorContent = document.content;
        this.titleControl.setValue(document.title);
      },
      err =>{
        console.error(err);
      }
    )
  }
  saveDocument(){
    this.saveInProgress = true;
    this.documentService.updateDocument(
      this.documentId,
      this.editorContent,
      this.titleControl.value || 'untitled'
    ).subscribe(
      () => {
        this.saveInProgress = false;
      },
      err => {
        console.error(err);
        this.saveInProgress = false;
      }
    );
  }


  // editorContent: string = '';
  // @ViewChild(QuillEditorComponent) editor!: QuillEditorComponent;
  // ngAfterViewInit() {
  //   this.editor.onContentChanged.subscribe((change: any) => {
  //     const delta = change.delta;
  //     if (change.source === 'user') {
  //       console.log(delta);
  //     }
  //   });
  // }
}
