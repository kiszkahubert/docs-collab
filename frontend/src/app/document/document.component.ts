import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
export class DocumentComponent implements OnInit, OnDestroy, AfterViewInit{
  documentId: string = '';
  editorContent: string = '';
  hasUnsavedChanges = false;
  titleControl = new FormControl('Nowy dokument');
  @ViewChild(QuillEditorComponent) editor!: QuillEditorComponent;
  private contentChangeSub: Subscription | undefined;
  private titleChangeSub: Subscription | undefined;
  private saveInProgress = false;
  private editorChangeSub : Subscription | undefined
  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService) {}
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.documentId = params['id'];
      if(this.documentId) this.loadDocument();
    });
    this.titleChangeSub = this.titleControl.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(()=>{
        if(this.documentId && !this.saveInProgress) this.saveDocument();
      })
  }
  ngAfterViewInit(){
    this.editorChangeSub = this.editor.onContentChanged
      .pipe(debounceTime(500))
      .subscribe((change: any) =>{
        if(change.source === 'user'){
          this.editorContent = this.editor.quillEditor.root.innerHTML;
          console.log(this.editorContent);
          this.hasUnsavedChanges = true;
          if(this.documentId && !this.saveInProgress){
            this.saveDocument();
          }
        }
      })
  }
  ngOnDestroy() {
    if (this.contentChangeSub) this.contentChangeSub.unsubscribe();
    if (this.titleChangeSub) this.titleChangeSub.unsubscribe();
    if (this.editorChangeSub) this.editorChangeSub.unsubscribe();
  }
  @HostListener('window:beforeunload',['$event'])
  async beforeUnloadHandler(event: BeforeUnloadEvent){
    if(this.documentId && !this.saveInProgress){
      event.returnValue = false;
      try{
        this.saveInProgress = true;
        await this.documentService.updateDocument(
          this.documentId,
          this.editorContent,
          this.titleControl.value || 'untitled'
        ).toPromise()
      } finally {
        this.saveInProgress = false;
      }
    }
  }
  loadDocument() {
    this.documentService.getDocument(this.documentId).subscribe(
      document => {
        this.editorContent = document.content;
        this.titleControl.setValue(document.title, { emitEvent: false });
        if (this.editor && this.editor.quillEditor) {
          this.editor.quillEditor.clipboard.dangerouslyPasteHTML(0, document.content);
        }
      },
      err => {
        console.error(err);
      }
    );
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
}
