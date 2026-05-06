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
      
      <div class="abstract-bg">
        <div class="glow-shape orange-glow"></div>
        <div class="glow-shape gray-glow"></div>
      </div>

      <div class="auth-wrapper">
        
        <aside class="auth-sidebar">
          <div class="sidebar-content">
            
            <div class="brand-container">
              <img src="vivere_logo.png" alt="Vivere Entretenimento" class="brand-logo" />
            </div>

            <div class="abstract-graphic">
              <div class="wire-box w-100 tall"></div>
              
              <div class="wire-row">
                <div class="wire-box w-30 highlight"></div>
                <div class="wire-box w-70"></div>
              </div>

              <div class="wire-row">
                <div class="wire-circle"></div>
                <div class="wire-box w-50"></div>
                <div class="wire-box w-20"></div>
              </div>

              <div class="wire-row">
                <div class="wire-box w-60"></div>
                <div class="wire-box w-40 highlight-soft"></div>
              </div>

              <div class="wire-tracks">
                <div class="track"><div class="track-fill w-80"></div></div>
                <div class="track"><div class="track-fill w-40 highlight-fill"></div></div>
                <div class="track"><div class="track-fill w-60"></div></div>
              </div>

              <div class="wire-row footer-wires">
                <div class="wire-box w-20"></div>
                <div class="wire-box w-80"></div>
              </div>
            </div>
            
          </div>
        </aside>

        <main class="auth-main">
          <div class="auth-card">
            @if (step() === 'register') {
              <div class="auth-head">
                <h2>Novo Cadastro</h2>
                <p>Configure o acesso para um novo colaborador no sistema.</p>
              </div>

              <div class="field">
                <label>Nome completo</label>
                <input [(ngModel)]="userData.name" placeholder="Ex: André Ribeiro" />
              </div>
              
              <div class="field">
                <label>E-mail corporativo</label>
                <input [(ngModel)]="userData.email" type="email" placeholder="voce@empresa.com" />
              </div>
              
              <div class="field">
                <label>Departamento de Atuação</label>
                <select [(ngModel)]="userData.role" class="select-role">
                  <option value="PRODUCAO">Equipe de Produção (Eventos)</option>
                  <option value="GALPAO">Equipe de Galpão (Estoque)</option>
                  <option value="ADMIN">Administrador Geral</option>
                </select>
              </div>

              <div class="field">
                <label>Senha de Acesso <span class="hint">mínimo 6 caracteres</span></label>
                <input [(ngModel)]="userData.password" type="password" placeholder="••••••••" />
              </div>

              <p *ngIf="errorMessage" class="msg-error">{{ errorMessage }}</p>

              <button class="btn-primary" (click)="register()" [disabled]="!userData.name || !userData.email || userData.password.length < 6">
                Concluir Registro
              </button>

              <div class="auth-actions">
                <button class="btn-link" (click)="mudarPasso('login')">Já possui conta? Entrar agora</button>
              </div>
            }

            @else if (step() === 'otp') {
              <div class="auth-head">
                <h2>Verificação em Duas Etapas</h2>
                <p>Para sua segurança, insira o código enviado para <strong>{{ userData.email }}</strong></p>
              </div>

              <div class="field">
                <label>Código de Autenticação</label>
                <input class="otp-input mono" [(ngModel)]="otpCode" placeholder="000000" maxlength="6" />
              </div>

              <button class="btn-primary" (click)="verifyOtp()">
                Validar Identidade
              </button>

              <div class="auth-actions">
                <button class="btn-link" (click)="mudarPasso('login')">Cancelar operação</button>
              </div>
            }

            @else {
              <div class="auth-head">
                <h2>Acesso Restrito</h2>
                <p>Identifique-se para gerenciar os recursos de infraestrutura.</p>
              </div>

              <div class="field">
                <label>E-mail corporativo</label>
                <input [(ngModel)]="userData.email" placeholder="nome@vivere.com" />
              </div>
              
              <div class="field">
                <label>Senha</label>
                <input [(ngModel)]="userData.password" type="password" placeholder="••••••••" />
              </div>

              <button class="btn-primary" (click)="login()">
                Acessar Plataforma
              </button>

              <div class="auth-actions">
                <button class="btn-link" (click)="mudarPasso('register')">Solicitar novo acesso ao administrador</button>
              </div>
            }
            
            <footer class="card-footer">
              Sistema de Gestão Vivere
            </footer>
          </div>
        </main>

      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      position: relative;
      min-height: 100vh;
      background-color: #fcfdfe;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .abstract-bg {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(#e2e8f0 1.2px, transparent 1.2px);
      background-size: 30px 30px;
      z-index: 0;
    }

    .glow-shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      z-index: 0;
      opacity: 0.5;
      pointer-events: none;
    }
    .orange-glow {
      width: 600px; height: 600px;
      background: rgba(255, 102, 0, 0.12);
      top: -150px; left: -100px;
    }
    .gray-glow {
      width: 700px; height: 700px;
      background: rgba(203, 213, 225, 0.3);
      bottom: -250px; right: -50px;
    }

    /* Wrapper maior para acomodar os campos horizontais */
    .auth-wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 1100px; 
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      align-items: center;
      padding: 40px;
      gap: 60px;
    }

    /* ===== SIDEBAR (ESQUERDA) ===== */
    .auth-sidebar {
      display: flex;
      flex-direction: column;
    }

    .brand-container {
      margin-bottom: 50px;
    }

    .brand-logo {
      max-width: 300px; /* Logo aumentada */
      height: auto;
      display: block;
      margin-bottom: 16px;
    }

    /* "Desenhos" Abstratos Detalhados */
    .abstract-graphic {
      display: flex;
      flex-direction: column;
      gap: 16px;
      opacity: 0.8;
    }

    .wire-box {
      height: 10px;
      background: #edf2f7;
      border-radius: 5px;
    }
    .wire-box.tall { height: 32px; background: #f1f5f9; }
    .wire-row { display: flex; gap: 16px; align-items: center; }
    .wire-circle {
      width: 12px; height: 12px;
      border: 3px solid #cbd5e1;
      border-radius: 50%;
    }
    
    .w-100 { width: 100%; }
    .w-80 { width: 80%; }
    .w-70 { width: 70%; }
    .w-60 { width: 60%; }
    .w-50 { width: 50%; }
    .w-40 { width: 40%; }
    .w-30 { width: 30%; }
    .w-20 { width: 20%; }
    
    .highlight { background: rgba(255, 102, 0, 0.3); }
    .highlight-soft { background: #e2e8f0; border: 1px dashed #cbd5e1; height: 20px; }

    /* Novo painel que substitui os quadradinhos */
    .wire-tracks {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 10px 0;
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #ffffff;
    }
    .track {
      height: 8px;
      background: #f1f5f9;
      border-radius: 4px;
      width: 100%;
    }
    .track-fill {
      height: 100%;
      background: #cbd5e1;
      border-radius: 4px;
    }
    .highlight-fill { background: rgba(255, 102, 0, 0.4); }

    .footer-wires { margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 20px; }

    /* ===== CARD (DIREITA) ===== */
    .auth-main {
      display: flex;
      justify-content: center;
    }

    .auth-card {
      background: #ffffff;
      width: 100%;
      max-width: 480px; /* Aumentado horizontalmente */
      padding: 48px;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .auth-head h2 {
      margin: 0 0 8px;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .auth-head p {
      margin: 0;
      font-size: 15px;
      color: #64748b;
      line-height: 1.5;
    }

    .field { display: flex; flex-direction: column; gap: 10px; }
    
    .field label {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }
    .field .hint {
      color: #94a3b8;
      font-weight: 400;
      font-size: 11.5px;
    }

    .field input, .select-role {
      padding: 14px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 15px;
      background: #f8fafc;
      color: #0f172a;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .field input:focus, .select-role:focus {
      outline: none;
      background: #ffffff;
      border-color: #ff6600;
      box-shadow: 0 0 0 4px rgba(255, 102, 0, 0.1);
    }

    .otp-input {
      letter-spacing: 16px;
      text-align: center;
      font-size: 28px !important;
      font-weight: 800;
      color: #ff6600 !important;
    }

    .btn-primary {
      margin-top: 10px;
      padding: 16px;
      background: #ff6600;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover:not(:disabled) { 
      background: #e65c00;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 102, 0, 0.2);
    }
    
    .btn-primary:disabled {
      background: #f1f5f9;
      color: #94a3b8;
      cursor: not-allowed;
    }

    .auth-actions { text-align: center; }

    .btn-link {
      background: none;
      border: none;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s;
    }

    .btn-link:hover { color: #ff6600; text-decoration: underline; }

    .msg-error {
      padding: 14px;
      background: #fff1f2;
      border: 1px solid #fecaca;
      color: #be123c;
      font-size: 14px;
      border-radius: 8px;
      font-weight: 600;
    }

    .card-footer {
      text-align: center;
      font-size: 12px;
      color: #cbd5e1;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      font-weight: 500;
    }

    @media (max-width: 950px) {
      .auth-wrapper { 
        grid-template-columns: 1fr;
        gap: 30px;
        padding: 20px;
      }
      .auth-sidebar { align-items: center; text-align: center; }
      .abstract-graphic { display: none; }
      .brand-container { margin-bottom: 20px; }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private userStore = inject(UserStore);
  private router = inject(Router);

  step = signal<'login' | 'register' | 'otp'>('login');
  userData = { name: '', email: '', password: '', role: 'PRODUCAO' };
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
        this.errorMessage = err.status === 400 ? 'E-mail já cadastrado no sistema.' : 'Falha na conexão com o servidor.';
      }
    });
  }

  verifyOtp() {
    this.authService.verifyOtp(this.userData.email, this.otpCode).subscribe({
      next: () => this.step.set('login'),
      error: () => this.errorMessage = 'O código inserido é inválido.'
    });
  }

  login() {
    this.authService.login(this.userData.email, this.userData.password).subscribe({
      next: (tokens: any) => {
        this.userStore.setTokens(tokens);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        alert('Credenciais incorretas.');
      }
    });
  }
}