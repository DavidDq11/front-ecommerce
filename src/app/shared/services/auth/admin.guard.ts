import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import Sweetalert2 from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      Sweetalert2.fire({
        title: 'Sesión no iniciada',
        text: 'Por favor, inicia sesión para acceder a esta sección.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return false;
    }

    if (!this.authService.isAdmin()) {
      Sweetalert2.fire({
        title: 'Acceso Denegado',
        text: 'Error de permisos.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.router.navigate(['/']);
      });
      return false;
    }
    return true;
  }
}