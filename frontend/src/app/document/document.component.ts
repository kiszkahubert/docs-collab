import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {QuillEditorComponent, QuillModule} from 'ngx-quill';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DocumentService} from '../services/document.service';
import {WebsocketService} from '../services/websocket.service';

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
  private editorChangeSub : Subscription | undefined;
  private isInitialized = false;
  private isApplyingRemoteUpdate = false;

  constructor(private route: ActivatedRoute, private documentService: DocumentService, private websocketService: WebsocketService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const newDocumentId = params['id'];
      if (this.documentId === newDocumentId && this.isInitialized) {
        return;
      }
      this.documentId = newDocumentId;
      this.isInitialized = true;
      this.websocketService.connectToDocument(this.documentId);
      if(this.documentId) {
        this.loadDocument();
      }
      this.setupWebSocketSubscription();
    });
    this.titleChangeSub = this.titleControl.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(()=>{
        if(this.documentId && !this.saveInProgress && !this.isApplyingRemoteUpdate) {
          this.saveDocument();
        }
      });
  }
  private setupWebSocketSubscription() {
    if (this.contentChangeSub) {
      this.contentChangeSub.unsubscribe();
    }
    this.contentChangeSub = this.websocketService.onContentUpdate.subscribe(update => {
      if (this.websocketService.getCurrentDocumentId() !== this.documentId) {
        return;
      }
      if (this.isApplyingRemoteUpdate) {
        return;
      }
      const currentContent = this.editor?.quillEditor?.root.innerHTML || '';
      const currentTitle = this.titleControl.value || '';
      if (currentContent === update.content && currentTitle === update.title) {
        return;
      }
      this.applyRemoteUpdate(update);
    });
  }
  private applyRemoteUpdate(update: {content: string, title: string}) {
    if (!this.editor || !this.editor.quillEditor) {
      this.editorContent = update.content;
      this.titleControl.setValue(update.title, { emitEvent: false });
      return;
    }
    this.isApplyingRemoteUpdate = true;
    try {
      const selection = this.editor.quillEditor.getSelection();
      const currentContent = this.editor.quillEditor.root.innerHTML;
      if (this.titleControl.value !== update.title) {
        this.titleControl.setValue(update.title, { emitEvent: false });
      }
      if (currentContent !== update.content) {
        this.temporarilyDisableChangeTracking();
        const quill = this.editor.quillEditor;
        quill.deleteText(0, quill.getLength());
        quill.clipboard.dangerouslyPasteHTML(0, update.content);
        this.editorContent = update.content;
        if (selection) {
          setTimeout(() => {
            if (this.editor && this.editor.quillEditor) {
              try {
                const textLength = this.editor.quillEditor.getLength();
                const safeIndex = Math.min(selection.index, Math.max(0, textLength - 1));
                const safeLength = Math.min(selection.length, Math.max(0, textLength - safeIndex));
                this.editor.quillEditor.setSelection(safeIndex, safeLength);
              } catch (error) {
                try {
                  const endPosition = this.editor.quillEditor.getLength() - 1;
                  this.editor.quillEditor.setSelection(Math.max(0, endPosition), 0);
                } catch (fallbackError) {}
              }
            }
          }, 0);
        }
        setTimeout(() => {
          this.enableChangeTracking();
        }, 100);
      }
    } finally {
      setTimeout(() => {
        this.isApplyingRemoteUpdate = false;
      }, 150);
    }
  }
  private temporarilyDisableChangeTracking() {
    if (this.editorChangeSub) {
      this.editorChangeSub.unsubscribe();
      this.editorChangeSub = undefined;
    }
  }
  private enableChangeTracking() {
    if (!this.editorChangeSub && this.editor) {
      this.setupEditorSubscription();
    }
  }
  ngAfterViewInit(){
    setTimeout(() => {
      this.setupEditorSubscription();
    }, 100);
  }
  private setupEditorSubscription() {
    if (this.editorChangeSub) {
      this.editorChangeSub.unsubscribe();
    }
    this.editorChangeSub = this.editor.onContentChanged
      .subscribe((change: any) =>{
        if (this.isApplyingRemoteUpdate) {
          return;
        }
        if(change.source === 'user'){
          this.editorContent = this.editor.quillEditor.root.innerHTML;
          this.hasUnsavedChanges = true;
          setTimeout(() => {
            if (!this.isApplyingRemoteUpdate) {
              this.websocketService.sendContentUpdate(
                this.editorContent,
                this.titleControl.value || 'Untitled'
              );
            }
          }, 50);
          if(this.documentId && !this.saveInProgress){
            this.saveDocument();
          }
        }
      });
  }

  ngOnDestroy() {
    this.isInitialized = false;
    if (this.contentChangeSub) this.contentChangeSub.unsubscribe();
    if (this.titleChangeSub) this.titleChangeSub.unsubscribe();
    if (this.editorChangeSub) this.editorChangeSub.unsubscribe();
  }

  @HostListener('window:beforeunload',['$event'])
  async beforeUnloadHandler(event: BeforeUnloadEvent){
    if(this.hasUnsavedChanges && this.documentId && !this.saveInProgress){
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
        this.hasUnsavedChanges = false;
        if (this.editor && this.editor.quillEditor) {
          this.editor.quillEditor.clipboard.dangerouslyPasteHTML(0, document.content);
        }
      },
      err => {}
    );
  }
  saveDocument(){
    if (this.saveInProgress || this.isApplyingRemoteUpdate) {
      return;
    }
    this.saveInProgress = true;
    this.documentService.updateDocument(
      this.documentId,
      this.editorContent,
      this.titleControl.value || 'untitled'
    ).subscribe(
      () => {
        this.saveInProgress = false;
        this.hasUnsavedChanges = false;
      },
      err => {
        this.saveInProgress = false;
      }
    );
  }
}
