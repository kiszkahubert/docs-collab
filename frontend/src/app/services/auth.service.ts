import { Injectable } from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from "rxjs";

interface LoginResponse{
  token: string;
  expiresIn: number;
}

interface RegisterDTO{
  email: string,
  password: string,
  name?: string,
  surname?: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService{
  constructor(private http: HttpClient) {}
  register(registerData: RegisterDTO): Observable<any>{
    return this.http.post('http://localhost:8080/auth/signup',registerData)
  }
  login(email: string, password: string): Observable<LoginResponse>{
    return this.http.post<LoginResponse>('http://localhost:8080/auth/login',{ email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('expiresIn', response.expiresIn.toString());
        })
    );
  }
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiresIn');
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const expiresIn = localStorage.getItem('expiresIn');
    if (!expiresIn) return false;
    const expirationDate = new Date(parseInt(expiresIn));
    return expirationDate > new Date();
  }
}

