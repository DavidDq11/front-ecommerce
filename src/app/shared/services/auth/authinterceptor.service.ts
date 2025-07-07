import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthinterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    let request = req;

    console.log('Interceptor: URL=', req.url, 'Token=', token);

    // No añadir Authorization header para rutas públicas o de invitados
    if (token && !this.isPublicOrGuestRoute(req.url)) {
      request = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isPublicOrGuestRoute(req.url)) {
          console.log('Interceptor: 401 error, redirecting to /login');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private isPublicOrGuestRoute(url: string): boolean {
    const publicRoutes = ['/api/login', '/api/register', '/api/guest-orders'];
    return publicRoutes.some(route => url.includes(route));
  }
}