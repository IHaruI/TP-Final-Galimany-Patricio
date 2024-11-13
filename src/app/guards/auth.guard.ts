import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    map((isAuthenticated) => !!isAuthenticated),
    tap((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(['/login']); // Redirige al login si no está autenticado
      }
    })
  );
};
