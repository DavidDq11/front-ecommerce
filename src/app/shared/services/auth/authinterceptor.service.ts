import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthinterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token='y2h3428sfjaqwrpfs3tx44gfskqpjmnvr8';
    const request = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    
    return next.handle(request);
  }
}
