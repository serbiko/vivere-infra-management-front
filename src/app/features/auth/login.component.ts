import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserStore } from '../../core/stores/user.store';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page">
      <!-- LADO ESQUERDO: BRAND -->
      <aside class="auth-brand">
        <div class="brand-grid"></div>
        <div class="brand-content">
          <div class="brand-tag">
            <span class="brand-dot"></span>
            <span>VIVERE • INFRA MANAGEMENT</span>
          </div>
          <h1 class="brand-title">
            Operação de eventos<br>
            <span class="accent">controlada na palma da mão.</span>
          </h1>
          <p class="brand-desc">
            Gestão de estoque, ordens de serviço e logística de montagem em uma plataforma única.
          </p>

          <ul class="brand-features">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Inventário sincronizado em tempo real
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Emissão de OS rastreável por evento
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Geolocalização de cargas e equipes
            </li>
          </ul>

          <div class="brand-footer">© {{ year }} Vivere — Todos os direitos reservados.</div>
        </div>
      </aside>

      <!-- LADO DIREITO: FORM -->
      <main class="auth-main">
        <div class="auth-card">

          @if (step() === 'register') {
            <header class="auth-head">
              <span class="auth-eyebrow">CADASTRO</span>
              <h2>Criar uma conta</h2>
              <p>Preencha os dados para acessar o sistema.</p>
            </header>

            <div class="field">
              <label>Nome completo</label>
              <input [(ngModel)]="userData.name" placeholder="Ex: André Ribeiro" />
            </div>
            <div class="field">
              <label>E-mail corporativo</label>
              <input [(ngModel)]="userData.email" type="email" placeholder="voce@empresa.com" />
            </div>
            <div class="field">
              <label>Senha <span class="hint">mínimo 6 caracteres</span></label>
              <input [(ngModel)]="userData.password" type="password" placeholder="••••••••" />
            </div>

            <p *ngIf="errorMessage" class="msg-error">{{ errorMessage }}</p>

            <button
              class="btn-primary"
              (click)="register()"
              [disabled]="!userData.name || !userData.email || userData.password.length < 6">
              Criar conta
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>

            <p class="link-row">Já tem conta? <a (click)="mudarPasso('login')">Entrar</a></p>
          }

          @else if (step() === 'otp') {
            <header class="auth-head">
              <span class="auth-eyebrow">VERIFICAÇÃO</span>
              <h2>Confirme seu e-mail</h2>
              <p>Enviamos um código de 6 dígitos para <strong>{{ userData.email }}</strong>.</p>
            </header>

            <div class="field">
              <label>Código de verificação</label>
              <input class="otp-input mono" [(ngModel)]="otpCode" placeholder="000000" maxlength="6" />
            </div>

            <button class="btn-primary" (click)="verifyOtp()">
              Verificar código
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>

            <p class="link-row"><a (click)="mudarPasso('login')">Voltar para login</a></p>
          }

          @else {
            <header class="auth-head">
              <span class="auth-eyebrow">ACESSO</span>
              <h2>Entrar no sistema</h2>
              <p>Use suas credenciais corporativas para continuar.</p>
            </header>

            <div class="field">
              <label>E-mail</label>
              <input [(ngModel)]="userData.email" placeholder="voce@empresa.com" />
            </div>
            <div class="field">
              <label>Senha</label>
              <input [(ngModel)]="userData.password" type="password" placeholder="••••••••" />
            </div>

            <button class="btn-primary" (click)="login()">
              Entrar
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>

            <p class="link-row">Não tem conta? <a (click)="mudarPasso('register')">Cadastre-se</a></p>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .auth-page {
      display: grid;
      grid-template-columns: 5fr 6fr;
      min-height: 100vh;
      background: var(--surface);
    }

    /* ===== Brand panel (esquerda) ===== */
    .auth-brand {
      position: relative;
      background: var(--sidebar-bg);
      color: #d4d4d4;
      padding: 48px 56px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .brand-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 32px 32px;
      mask-image: radial-gradient(ellipse at 30% 30%, black 0%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at 30% 30%, black 0%, transparent 70%);
    }
    .brand-content {
      position: relative;
      z-index: 1;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .brand-tag {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 6px 11px;
      align-self: flex-start;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: var(--radius);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 1.2px;
      color: #cccccc;
    }
    .brand-tag .brand-dot {
      width: 7px; height: 7px;
      background: var(--vivere-orange);
      border-radius: 2px;
      box-shadow: 0 0 0 3px rgba(255,102,0,0.2);
    }
    .brand-title {
      margin: 32px 0 16px;
      font-size: 38px;
      line-height: 1.15;
      font-weight: 700;
      color: #f5f5f5;
      letter-spacing: -0.8px;
    }
    .brand-title .accent {
      color: var(--vivere-orange);
    }
    .brand-desc {
      max-width: 420px;
      color: #9a9a9a;
      font-size: 14.5px;
      line-height: 1.55;
      margin: 0 0 36px;
    }
    .brand-features {
      list-style: none;
      padding: 0;
      margin: 0 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .brand-features li {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13.5px;
      color: #c4c4c4;
    }
    .brand-features svg {
      width: 16px; height: 16px;
      padding: 3px;
      background: rgba(255,102,0,0.12);
      border: 1px solid rgba(255,102,0,0.25);
      border-radius: var(--radius-sm);
      color: var(--vivere-orange);
      box-sizing: content-box;
    }
    .brand-footer {
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 12px;
      color: #666;
    }

    /* ===== Form panel (direita) ===== */
    .auth-main {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .auth-card {
      width: 100%;
      max-width: 380px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .auth-head { margin-bottom: 8px; }
    .auth-eyebrow {
      display: inline-block;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 1.6px;
      color: var(--vivere-orange);
      margin-bottom: 12px;
    }
    .auth-head h2 {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.4px;
      color: var(--text-strong);
      margin: 0 0 8px;
    }
    .auth-head p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 13.5px;
      line-height: 1.5;
    }

    /* Form fields */
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .field .hint {
      font-weight: 400;
      color: var(--text-tertiary);
      font-size: 11px;
    }
    .field input {
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      font-size: 14px;
      color: var(--text-primary);
      transition: border-color var(--duration) var(--ease), box-shadow var(--duration) var(--ease);
    }
    .field input::placeholder { color: var(--text-muted); }
    .field input:hover { border-color: var(--border-strong); }
    .field input:focus {
      outline: none;
      border-color: var(--vivere-orange);
      box-shadow: 0 0 0 3px rgba(255, 102, 0, 0.12);
    }
    .otp-input {
      letter-spacing: 8px;
      text-align: center;
      font-size: 20px !important;
      font-weight: 600;
    }

    /* Primary button */
    .btn-primary {
      margin-top: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 18px;
      background: var(--vivere-orange);
      color: white;
      border: 1px solid var(--vivere-orange);
      border-radius: var(--radius);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--duration) var(--ease);
    }
    .btn-primary svg { width: 15px; height: 15px; transition: transform var(--duration) var(--ease); }
    .btn-primary:hover:not(:disabled) {
      background: var(--vivere-orange-hover);
      border-color: var(--vivere-orange-hover);
    }
    .btn-primary:hover:not(:disabled) svg { transform: translateX(2px); }
    .btn-primary:active:not(:disabled) { background: var(--vivere-orange-active); }
    .btn-primary:disabled {
      background: var(--surface-sunken);
      color: var(--text-muted);
      border-color: var(--border);
      cursor: not-allowed;
    }

    .msg-error {
      margin: 0;
      padding: 9px 12px;
      background: var(--status-danger-bg);
      border: 1px solid var(--status-danger-border);
      border-radius: var(--radius);
      color: var(--status-danger);
      font-size: 12.5px;
      font-weight: 500;
    }

    .link-row {
      margin: 0;
      text-align: center;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .link-row a {
      color: var(--vivere-orange);
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    .link-row a:hover { text-decoration: underline; }

    /* Mobile collapse */
    @media (max-width: 900px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-brand { padding: 32px; }
      .brand-title { font-size: 28px; }
      .brand-features { display: none; }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private userStore = inject(UserStore);
  private router = inject(Router);

  step = signal<'login' | 'register' | 'otp'>('login');
  userData = { name: '', email: '', password: '' };
  otpCode = '';
  errorMessage = '';
  year = new Date().getFullYear();

  mudarPasso(novoPasso: 'login' | 'register' | 'otp') {
    this.errorMessage = '';
    this.step.set(novoPasso);
  }

  register() {
    this.errorMessage = '';
    this.authService.register(this.userData).subscribe({
      next: () => this.step.set('otp'),
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.status === 400
          ? 'Este e-mail já está cadastrado.'
          : 'Erro de comunicação com o servidor.';
      }
    });
  }

  verifyOtp() {
    this.authService.verifyOtp(this.userData.email, this.otpCode)
      .subscribe(() => this.step.set('login'));
  }

  login() {
    this.authService.login(this.userData.email, this.userData.password).subscribe({
      next: (tokens) => {
        this.userStore.setTokens(tokens);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro detalhado no login:', err);
        alert('Falha no login: verifique suas credenciais.');
      }
    });
  }
}