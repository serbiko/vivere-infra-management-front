import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/auth';

  register(user: RegisterPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  verifyOtp(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, code });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }
}