import { Component } from '@angular/core';
import {AuthComponentComponent} from '../auth-component/auth-component.component';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

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
  constructor(private authService: AuthService, private router: Router) {}
  handleRegister(creds: { email: string, password: string, name?: string, surname?: string }){
    console.log(creds);
    this.authService.register(creds)
      .subscribe({
        next: (user) => {
          this.router.navigate(['/login'])
        },
        error: (err) => {
          console.error(err);
        }
      })
  }
}
