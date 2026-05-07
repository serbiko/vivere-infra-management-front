import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Agora buscamos o token diretamente de onde o UserStore o guardou!
  const token = localStorage.getItem('accessToken');

  if (token) {
    // Clona a requisição original e adiciona o cabeçalho de Autorização
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  // Se não tem token (ex: tela de login), segue a requisição normalmente
  return next(req);
};