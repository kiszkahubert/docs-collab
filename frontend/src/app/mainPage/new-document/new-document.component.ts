import { Component } from '@angular/core';
import {ExistingDocumentComponent} from '../existing-document/existing-document.component';

@Component({
  selector: 'app-new-document',
  imports: [
    ExistingDocumentComponent
  ],
  templateUrl: './new-document.component.html',
  styleUrl: './new-document.component.css'
})
export class NewDocumentComponent {

}
