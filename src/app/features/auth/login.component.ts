import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserStore } from '../../core/stores/user.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      @if (step() === 'register') {
        <h2>Criar Conta</h2>
        <input [(ngModel)]="userData.name" placeholder="Nome completo">
        <input [(ngModel)]="userData.email" placeholder="E-mail">
        <input [(ngModel)]="userData.password" type="password" placeholder="Senha">
        <button (click)="register()">Cadastrar</button>
        <p (click)="step.set('login')">Já tem conta? Entre aqui</p>
      } 
      
      @else if (step() === 'otp') {
        <h2>Verificar E-mail</h2>
        <p>Digitie o código de 6 dígitos enviado para {{ userData.email }}</p>
        <input [(ngModel)]="otpCode" placeholder="000000" maxlength="6">
        <button (click)="verifyOtp()">Verificar</button>
      } 

      @else {
        <h2>Entrar</h2>
        <input [(ngModel)]="userData.email" placeholder="E-mail">
        <input [(ngModel)]="userData.password" type="password" placeholder="Senha">
        <button (click)="login()">Entrar</button>
        <p (click)="step.set('register')">Não tem conta? Cadastre-se</p>
      }
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 100px auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; display: flex; flex-direction: column; gap: 1rem; }
    input { padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 0.8rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    p { color: blue; cursor: pointer; font-size: 0.9rem; text-align: center; }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private userStore = inject(UserStore);
  private router = inject(Router);

  step = signal<'login' | 'register' | 'otp'>('login');
  userData = { name: '', email: '', password: '' };
  otpCode = '';

  register() {
    this.authService.register(this.userData).subscribe(() => this.step.set('otp'));
  }

  verifyOtp() {
    this.authService.verifyOtp(this.userData.email, this.otpCode).subscribe(() => this.step.set('login'));
  }

  login() {
  console.log('Tentando logar com:', this.userData.email);
  
  this.authService.login(this.userData.email, this.userData.password).subscribe({
    next: (tokens) => {
      console.log('Tokens recebidos com sucesso:', tokens);
      
      // Armazena os tokens na Store
      this.userStore.setTokens(tokens); 
      
      // Força a navegação para o dashboard
      this.router.navigate(['/dashboard']).then(nav => {
        console.log('Navegação para dashboard realizada?', nav);
      });
    },
    error: (err) => {
      console.error('Erro detalhado no login:', err);
      alert('Falha no login: verifique suas credenciais.');
    }
  });
}
}