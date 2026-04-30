import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { UserStore } from './core/stores/user.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div style="display: flex; height: 100vh; overflow: hidden; background: #f8f9fa;">
      
      <aside *ngIf="!isLoginPage()" style="width: 260px; background: #1a1a1a; color: white; display: flex; flex-direction: column; z-index: 100;">
        <div style="padding: 30px 20px; text-align: center; border-bottom: 1px solid #333;">
          <h1 style="color: #ff6600; margin: 0; font-size: 1.8rem; letter-spacing: 2px; cursor:pointer" (click)="router.navigate(['/dashboard'])">VIVERE</h1>
          <small style="color: #666; letter-spacing: 1px;">INFRA MANAGEMENT</small>
        </div>

        <nav style="flex: 1; padding: 20px 0;">
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li class="nav-item" routerLink="/dashboard" routerLinkActive="active">📊 Dashboard</li>
            <li class="nav-item" routerLink="/eventos" routerLinkActive="active">📅 Eventos</li>
            <li class="nav-item" routerLink="/ordens" routerLinkActive="active">📝 Ordens de Serviço</li>
            <li class="nav-item" routerLink="/estoque" routerLinkActive="active">📦 Estoque</li>
          </ul>
        </nav>

        <div style="padding: 20px; border-top: 1px solid #333;">
          <button (click)="logout()" class="btn-logout">Sair do Sistema</button>
        </div>
      </aside>

      <main style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .nav-item { padding: 15px 25px; cursor: pointer; transition: 0.3s; border-left: 4px solid transparent; color: #bbb; font-weight: 500; text-decoration: none; display: block; }
    .nav-item:hover, .active { background: #252525; color: #ff6600 !important; border-left: 4px solid #ff6600; }
    .btn-logout { width: 100%; padding: 12px; background: #333; color: #ff4d4d; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
  `]
})
export class AppComponent {
  public router = inject(Router);
  private userStore = inject(UserStore);

  isLoginPage() { return this.router.url === '/login' || this.router.url === '/'; }
  logout() { this.userStore.logout(); this.router.navigate(['/login']); }
}