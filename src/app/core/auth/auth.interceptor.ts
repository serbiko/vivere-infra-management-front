import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserStore } from '../stores/user.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userStore = inject(UserStore);
  const accessToken = userStore.tokens()?.accessToken;

  // Se tivermos um token, clonamos a requisição e adicionamos o cabeçalho de Autorização
  if (accessToken) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
    return next(authReq);
  }

  return next(req);
};