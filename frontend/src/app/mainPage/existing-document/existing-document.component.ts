import {Component, Input} from '@angular/core';
import {Document} from '../../services/document.service';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-existing-document',
  imports: [CommonModule],
  templateUrl: './existing-document.component.html',
  styleUrl: './existing-document.component.css'
})
export class ExistingDocumentComponent {
  @Input() document!: Document;
  constructor(private router: Router){}
  openDocument(): void{
    this.router.navigate(['/document',this.document._id])
  }
}
