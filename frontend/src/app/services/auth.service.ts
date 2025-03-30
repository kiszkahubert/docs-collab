import { Injectable } from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from "rxjs";
import { Router } from "@angular/router";


interface LoginResponse{
  success: boolean;
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
  private isLoggedIn = false;
  constructor(private http: HttpClient, private router: Router) {}
  register(registerData: RegisterDTO): Observable<any>{
    return this.http.post('http://localhost:3000/auth/register',registerData)
  }
  login(email: string, password: string): Observable<LoginResponse>{
    return this.http.post<LoginResponse>('http://localhost:3000/auth/login',{ email, password }, {withCredentials: true})
      .pipe(
        tap(response => {
          if(response.success){
            this.isLoggedIn = true;
          }
        })
    );
  }
  logout(): Observable<any> {
    return this.http.post(
      'http://localhost:3000/auth/logout', {}, {withCredentials:true}
    ).pipe(
      tap(()=>{
        this.isLoggedIn = false
        this.router.navigate(['/login'])
      })
    )
  }
  isAuthenticated(): Observable<boolean>{
    return this.http.get<boolean>(
      'http://localhost:3000/api/validate', {withCredentials:true}).pipe(
        tap({
          error: () => {
            console.log("WAS ERROR HERE")
          }
        })
    )
  }
}

