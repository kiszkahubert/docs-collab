import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {QuillEditorComponent, QuillModule} from 'ngx-quill';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-document',
  imports: [QuillModule, FormsModule],
  templateUrl: './document.component.html',
  styleUrl: './document.component.css'
})
export class DocumentComponent implements AfterViewInit{
  editorContent: string = '';
  @ViewChild(QuillEditorComponent) editor!: QuillEditorComponent;
  ngAfterViewInit() {
    this.editor.onContentChanged.subscribe((change: any) => {
      const delta = change.delta;
      if (change.source === 'user') {
        console.log(delta);
      }
    });
  }
}
