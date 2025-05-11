// src/app/services/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.accessToken; // Get the token from AuthService

    if (token) {
      // Clone the request and add the Authorization header with the token
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      // Pass the cloned request to the next handler
      return next.handle(clonedRequest);
    }

    // If no token, just pass the original request
    return next.handle(req);
  }
}
