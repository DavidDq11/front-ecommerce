import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Adjust path as needed
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthinterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    let request = req;

    // Add Authorization header only if token exists and request is not for public routes
    if (token && !this.isPublicRoute(req.url)) {
      request = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout(); // Clears token and redirects to /login
        }
        return throwError(() => error);
      })
    );
  }

  private isPublicRoute(url: string): boolean {
    const publicRoutes = ['/login', '/register'];
    return publicRoutes.some(route => url.includes(route));
  }
}