import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AuthComponentComponent} from '../auth-component/auth-component.component';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, AuthComponentComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent{
  constructor(private authService: AuthService, private router: Router) {}
  handleLogin(creds: { email: string, password: string }) {
    this.authService.login(creds.email, creds.password)
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
}
