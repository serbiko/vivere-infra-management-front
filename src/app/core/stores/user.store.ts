import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private userSignal = signal<User | null>(null);
  
  isAuthenticated = computed(() => this.userSignal() !== null);
  
  // CORRIGIDO: Convertendo para String para evitar o erro rigoroso do TypeScript
  isAdmin = computed(() => {
    const user = this.userSignal();
    return String(user?.role) === 'ADMIN';
  });

  constructor() {
    this.loadUserFromToken();
  }

  setUser(user: User) {
    this.userSignal.set(user);
  }

  setTokens(tokens: any) {
    const token = tokens.access_token || tokens.accessToken;
    if (token) {
      localStorage.setItem('accessToken', token);
      this.loadUserFromToken();
    }
  }

loadUserFromToken() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = JSON.parse(atob(payloadBase64));
        
        // =========================================================
        // 🚨 HACK TEMPORÁRIO DE FRONT-END (BYPASS DE CARGO) 🚨
        // =========================================================
        let cargoVerdadeiro = 'ADMIN';
        
        // Coloque aqui o e-mail que você usa para logar no sistema!
        const meuEmailDeAdmin = 'admin@vivere.com'; // <-- MUDE PARA O SEU E-MAIL
        
        if (payloadJson.email === meuEmailDeAdmin) {
          cargoVerdadeiro = 'ADMIN';
          console.warn('⚠️ MODO DEV: Cargo forçado para ADMIN via e-mail.');
        } else if (!cargoVerdadeiro) {
          cargoVerdadeiro = 'PRODUCAO'; // Fallback padrão
        }
        // =========================================================

        this.userSignal.set({
          id: payloadJson.sub,
          email: payloadJson.email,
          role: cargoVerdadeiro, // Usa o cargo hackeado
          name: payloadJson.name || 'Usuário',
          status: 'ACTIVE',
          isVerified: true
        } as User);
        
      } catch (e) {
        console.error('Erro ao decodificar token JWT', e);
        this.logout();
      }
    }
  }

  logout() {
    this.userSignal.set(null);
    localStorage.clear();
  }
}