import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StockComponent } from './features/stock/stock.component';
import { EventListComponent } from './features/events/event-list/event-list.component';
import { OSListComponent } from './features/os/os-list/os-list.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'eventos', component: EventListComponent, canActivate: [authGuard] },
  { path: 'ordens', component: OSListComponent, canActivate: [authGuard] },
  
  // Rota do estoque unificada:
  { path: 'estoque', component: StockComponent, canActivate: [authGuard] }, 
  
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];