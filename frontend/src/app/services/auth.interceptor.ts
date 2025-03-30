import {HttpErrorResponse, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {catchError} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const modifiedReq = req.clone({
    withCredentials: true
  });
  return next(modifiedReq).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        router.navigate(['/login']);
      }
      throw error;
    })
  );
};
