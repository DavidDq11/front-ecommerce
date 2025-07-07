import { inject } from '@angular/core';
import { Router, RouterStateSnapshot, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';

export const canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const isGuest = history.state.isGuest || route.queryParams['isGuest'] === 'true';
  console.log('AuthGuard: isLogged=', !!localStorage.getItem('isLogged'), 'isGuest=', isGuest); // Log para depuración

  if (localStorage.getItem('isLogged') || isGuest) {
    return true;
  } else {
    console.log('AuthGuard: Redirecting to /login');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}