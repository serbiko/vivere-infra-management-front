import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { EventService } from '../../core/services/event.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MapComponent],
  template: `
    <header style="background: white; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
      <h2 style="color: #1a1a1a; margin: 0; font-weight: 800; letter-spacing: -0.5px;">DASHBOARD OPERACIONAL</h2>
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="text-align: right; line-height: 1.2;">
          <span style="display: block; font-size: 0.9rem; font-weight: bold; color: #333;">André Ribeiro</span>
          <small style="color: #999; font-weight: 600; text-transform: uppercase; font-size: 0.7rem;">Administrador</small>
        </div>
        <div class="avatar-circle">AR</div>
      </div>
    </header>

    <main style="padding: 30px; flex: 1;">
      
      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 25px; margin-bottom: 25px;">
        
        <div class="dashboard-card">
          <div class="card-header-vivere">
            <span>📍 LOCALIZAÇÃO DE EVENTOS ATIVOS</span>
          </div>
          <app-map [viewOnly]="true"></app-map>
        </div>

        <div class="dashboard-card">
          <div class="card-header-vivere">
            <span>🗓️ AGENDA DE MONTAGENS - ABRIL 2026</span>
          </div>
          <div class="vivere-calendar">
            <div class="cal-weekdays">
              <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span>
            </div>
            <div class="cal-days">
              <div *ngFor="let d of calendarDays" class="day-box" 
                   [class.has-event]="d === 30" 
                   [class.not-month]="d < 1 && d > 30">
                {{ d > 0 ? d : '' }}
                <div *ngIf="d === 30" class="event-tag-vivere">Show Verão</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1.6fr; gap: 25px;">
         
         <div class="dashboard-card">
          <div class="card-header-vivere">
            <span>📊 STATUS DOS MATERIAIS</span>
          </div>
          <div style="height: 250px; position: relative;">
            <canvas id="stockChart"></canvas>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-header-vivere">
            <span>🚚 PRÓXIMAS SAÍDAS DE CARGA</span>
          </div>
          <table class="vivere-table-dash">
            <thead>
              <tr>
                <th>EVENTO</th>
                <th>STATUS LOGÍSTICO</th>
                <th>SAÍDA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Aniversário Vivere 20 Anos</strong></td>
                <td><span class="badge-vivere orange">Aguardando OS</span></td>
                <td>08:30</td>
              </tr>
              <tr>
                <td><strong>Palco Principal - Expo Inter</strong></td>
                <td><span class="badge-vivere green">Carregado</span></td>
                <td>14:00</td>
              </tr>
              <tr>
                <td><strong>Tendas Camarote VIP</strong></td>
                <td><span class="badge-vivere gray">Planejamento</span></td>
                <td>Amanhã</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .dashboard-card { 
      background: white; 
      padding: 20px; 
      border-radius: 12px; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.05); 
      border: 1px solid #eee;
    }
    
    .card-header-vivere { 
      font-weight: 800; 
      color: #999; 
      margin-bottom: 20px; 
      font-size: 0.75rem; 
      letter-spacing: 1.2px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .avatar-circle { 
      width: 40px; 
      height: 40px; 
      background: #ff6600; 
      border-radius: 10px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: white; 
      font-weight: bold; 
      box-shadow: 0 4px 10px rgba(255, 102, 0, 0.3);
    }

    /* CALENDÁRIO */
    .vivere-calendar { border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden; }
    .cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); background: #fcfcfc; border-bottom: 1px solid #f0f0f0; }
    .cal-weekdays span { padding: 10px; font-size: 0.65rem; font-weight: bold; text-align: center; color: #bbb; text-transform: uppercase; }
    .cal-days { display: grid; grid-template-columns: repeat(7, 1fr); height: 280px; }
    .day-box { border-right: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; padding: 8px; font-size: 0.75rem; color: #ddd; }
    .day-box.has-event { background: #fff9f5; color: #ff6600; font-weight: bold; }
    .event-tag-vivere { font-size: 0.6rem; background: #ff6600; color: white; padding: 2px 5px; border-radius: 4px; margin-top: 5px; display: inline-block; }

    /* TABELA */
    .vivere-table-dash { width: 100%; border-collapse: collapse; }
    .vivere-table-dash th { text-align: left; font-size: 0.7rem; color: #bbb; padding: 12px 10px; text-transform: uppercase; }
    .vivere-table-dash td { padding: 16px 10px; border-bottom: 1px solid #fcfcfc; font-size: 0.85rem; color: #444; }
    
    .badge-vivere { padding: 5px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
    .badge-vivere.orange { background: #fff5eb; color: #ff6600; }
    .badge-vivere.green { background: #e8f5e9; color: #2ecc71; }
    .badge-vivere.gray { background: #f5f5f5; color: #999; }
  `]
})
export class DashboardComponent implements OnInit {
  public router = inject(Router);
  public eventService = inject(EventService);
  
  // Dias para preencher o grid do calendário de Abril/2026
  calendarDays = [
    -1, 0, 1, 2, 3, 4, 5, 
    6, 7, 8, 9, 10, 11, 12, 
    13, 14, 15, 16, 17, 18, 19, 
    20, 21, 22, 23, 24, 25, 26, 
    27, 28, 29, 30, 31
  ];

  ngOnInit() {
    // Timeout pequeno para garantir que o elemento canvas já esteja no DOM
    setTimeout(() => this.initStockChart(), 100);
  }

  initStockChart() {
    const ctx = document.getElementById('stockChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Treliças', 'Tendas', 'Praticáveis', 'Cabos'],
          datasets: [{
            label: 'Em Uso',
            data: [12, 19, 7, 5],
            backgroundColor: '#ff6600',
            borderRadius: 6
          }, {
            label: 'Disponível',
            data: [8, 5, 10, 15],
            backgroundColor: '#1a1a1a',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              position: 'bottom',
              labels: { font: { weight: 'bold', size: 11 } } 
            } 
          },
          scales: { 
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  }
}