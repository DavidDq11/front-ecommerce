import { inject } from '@angular/core';
import { Router, RouterStateSnapshot, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const isGuest = history.state.isGuest || route.queryParams['isGuest'] === 'true';

  console.log('AuthGuard: isLogged=', authService.isLoggedIn(), 'isGuest=', isGuest);

  if (isGuest) {
    return true; // Permitir acceso a rutas de invitado
  }

  if (authService.isLoggedIn()) {
    // Validar token con el backend para mayor seguridad
    return authService.getUserDetails().pipe(
      map(() => true),
      catchError(error => {
        console.log('AuthGuard: Invalid token, redirecting to /login');
        authService.logout(false); // No mostrar mensaje de inactividad
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return of(false);
      })
    );
  } else {
    console.log('AuthGuard: No token found, redirecting to /login');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false; // No llamar a logout aquí
  }
};