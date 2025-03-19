import { Component } from '@angular/core';
import {NewDocumentComponent} from '../new-document/new-document.component';

@Component({
  selector: 'app-main-page-combined',
  imports: [
    NewDocumentComponent
  ],
  templateUrl: './main-page-combined.component.html',
  styleUrl: './main-page-combined.component.css'
})
export class MainPageCombinedComponent {

}
