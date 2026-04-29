import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthTokens, User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  // O back dele está rodando na porta 8081 por padrão
  private readonly API_URL = 'http://localhost:8081/auth'; 

  login(email: string, password: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.API_URL}/login`, { email, password });
  }

  // Novo: Método para registrar usuário (conforme auth.controller.ts)
  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  // Novo: Método para verificar o código numérico enviado por email
  verifyOtp(email: string, code: string): Observable<any> {
    return this.http.post(`${this.API_URL}/verify-otp`, { email, code });
  }

  refreshToken(userId: string, refreshToken: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.API_URL}/refresh`, { userId, refreshToken });
  }
}