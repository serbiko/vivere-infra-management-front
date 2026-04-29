import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserStore } from '../stores/user.store';

export const authGuard: CanActivateFn = () => {
  const userStore = inject(UserStore);
  const router = inject(Router);

  if (userStore.isAuthenticated()) {
    return true;
  }

  // Se não estiver logado, manda para a tela de login
  router.navigate(['/login']);
  return false;
};