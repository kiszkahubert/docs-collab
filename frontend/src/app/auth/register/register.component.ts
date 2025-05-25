import { Component } from '@angular/core';
import {AuthComponentComponent} from '../auth-component/auth-component.component';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    AuthComponentComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}
  handleRegister(creds: { email: string, password: string, name?: string, surname?: string }){
    this.authService.register(creds)
      .subscribe({
        next: (user) => {
          this.router.navigate(['/login'])
        },
        error: (err) => {
          const errorMessage = err.error?.message || "Błąd rejestracji";
          this.snackBar.open(errorMessage, 'OK',{duration:2000})
        }
      })
  }
}
