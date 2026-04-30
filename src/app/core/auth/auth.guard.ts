import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserStore } from '../stores/user.store';

export const authGuard: CanActivateFn = () => {
  const userStore = inject(UserStore);
  const router = inject(Router);

  const isAuth = userStore.isAuthenticated();
  console.log('AuthGuard verificando acesso. Está autenticado?', isAuth);

  if (isAuth) {
    return true;
  }

  console.warn('Acesso negado pelo Guard. Redirecionando para login...');
  router.navigate(['/login']);
  return false;
};