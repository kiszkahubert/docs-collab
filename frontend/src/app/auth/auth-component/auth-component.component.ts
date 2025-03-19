import { Component, EventEmitter, input, OnInit, Output, signal, AfterViewInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-auth-component',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './auth-component.component.html',
  styleUrl: './auth-component.component.css'
})
export class AuthComponentComponent implements AfterViewInit {
  title = input.required<string>();
  buttonText = input.required<string>();
  linkText = input.required<string>();
  linkUrl = input.required<string>();
  isLogin = input.required<boolean>();
  @Output() formSubmit = new EventEmitter<{
    email: string,
    password: string,
    name?: string,
    surname?: string
  }>;
  email: string = '';
  password: string = '';
  name?: string = '';
  surname?: string = '';
  submitForm() {
    this.formSubmit.emit({
      email: this.email,
      password: this.password,
      name: this.name,
      surname: this.surname
    });
  }
  ngAfterViewInit() {
    this.setupCursors();
  }
  setupCursors() {
    const cursorsToSetup = [
      { inputId: 'email-input', cursorId: 'cursor-email' },
      { inputId: 'password-input', cursorId: 'cursor-password' }
    ];
    if (!this.isLogin()) {
      cursorsToSetup.push(
        { inputId: 'name-input', cursorId: 'cursor-name' },
        { inputId: 'surname-input', cursorId: 'cursor-surname' }
      );
    }
    cursorsToSetup.forEach(({ inputId, cursorId }) => {
      const input = document.getElementById(inputId);
      const cursor = document.getElementById(cursorId);
      if (!input || !cursor) {
        return;
      }
      this.setupCursor(input as HTMLInputElement, cursor as HTMLElement);
    });
  }
  private setupCursor(input: HTMLInputElement, cursor: HTMLElement): void {
    const measureDiv = document.createElement('div');
    const computedStyle = window.getComputedStyle(input);
    measureDiv.style.position = 'fixed';
    measureDiv.style.visibility = 'hidden';
    measureDiv.style.whiteSpace = 'pre';
    measureDiv.style.fontFamily = computedStyle.fontFamily;
    measureDiv.style.fontSize = computedStyle.fontSize;
    measureDiv.style.padding = computedStyle.padding;
    document.body.appendChild(measureDiv);
    const updateCursorPosition = () => {
      measureDiv.textContent = input.value.length > 0 ? input.value : '';
      cursor.style.left = `${measureDiv.offsetWidth}px`;
    };
    input.addEventListener('input', updateCursorPosition);
    input.addEventListener('focus', () => {
      cursor.style.display = 'block';
      updateCursorPosition();
    });
    input.addEventListener('blur', () => {
      cursor.style.display = 'none';
    });
    updateCursorPosition();
  }
}
