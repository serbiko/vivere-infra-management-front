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
    <header class="page-header">
      <div class="page-header__title">
        <span class="eyebrow">Visão geral</span>
        <h1>Dashboard operacional</h1>
      </div>

      <div class="page-header__right">
        <button class="btn-ghost">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Buscar</span>
          <kbd>⌘K</kbd>
        </button>
        <div class="user-chip">
          <div class="avatar-square">AR</div>
          <div class="user-meta">
            <span class="user-name">André Ribeiro</span>
            <span class="user-role">Administrador</span>
          </div>
        </div>
      </div>
    </header>

    <section class="kpi-strip">
      <div class="kpi">
        <span class="kpi-label">Eventos ativos</span>
        <span class="kpi-value tnum">12</span>
        <span class="kpi-trend up">+2 este mês</span>
      </div>
      <div class="kpi">
        <span class="kpi-label">OS pendentes</span>
        <span class="kpi-value tnum">07</span>
        <span class="kpi-trend warn">3 vencendo hoje</span>
      </div>
      <div class="kpi">
        <span class="kpi-label">Materiais em uso</span>
        <span class="kpi-value tnum">452</span>
        <span class="kpi-trend muted">de 612 totais</span>
      </div>
      <div class="kpi">
        <span class="kpi-label">Alertas de estoque</span>
        <span class="kpi-value tnum danger">03</span>
        <span class="kpi-trend danger">Reposição necessária</span>
      </div>
    </section>

    <main class="dash-main">
      <div class="grid-row" style="grid-template-columns: 1.4fr 1fr;">
        <article class="card">
          <header class="card__head">
            <span class="card__title">Localização de eventos ativos</span>
            <span class="card__hint">Atualizado agora</span>
          </header>
          <div class="card__body card__body--flush">
            <app-map [viewOnly]="true"></app-map>
          </div>
        </article>

        <article class="card">
          <header class="card__head">
            <span class="card__title">Agenda de montagens — Abr/2026</span>
            <button class="btn-mini">Ver tudo</button>
          </header>
          <div class="card__body">
            <div class="cal">
              <div class="cal__weekdays">
                <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
              </div>
              <div class="cal__days">
                <div *ngFor="let d of calendarDays" class="cal-cell"
                  [class.is-today]="d === 30"
                  [class.is-empty]="d <= 0">
                  <span class="cal-num mono">{{ d > 0 ? d : '' }}</span>
                  <div *ngIf="d === 30" class="cal-event">Show Verão</div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="grid-row" style="grid-template-columns: 1fr 1.6fr;">
        <article class="card">
          <header class="card__head">
            <span class="card__title">Status dos materiais</span>
          </header>
          <div class="card__body" style="height: 240px; position: relative;">
            <canvas id="stockChart"></canvas>
          </div>
        </article>

        <article class="card">
          <header class="card__head">
            <span class="card__title">Próximas saídas de carga</span>
            <button class="btn-mini">Ver agenda completa</button>
          </header>
          <div class="card__body card__body--flush">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Status logístico</th>
                  <th class="cell-right">Saída</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="td-strong">Aniversário Vivere 20 Anos</div>
                    <div class="td-sub mono">OS-2026-0418</div>
                  </td>
                  <td><span class="badge badge--warn">Aguardando OS</span></td>
                  <td class="cell-right mono">08:30</td>
                </tr>
                <tr>
                  <td>
                    <div class="td-strong">Palco Principal — Expo Inter</div>
                    <div class="td-sub mono">OS-2026-0417</div>
                  </td>
                  <td><span class="badge badge--success">Carregado</span></td>
                  <td class="cell-right mono">14:00</td>
                </tr>
                <tr>
                  <td>
                    <div class="td-strong">Tendas Camarote VIP</div>
                    <div class="td-sub mono">OS-2026-0419</div>
                  </td>
                  <td><span class="badge badge--neutral">Planejamento</span></td>
                  <td class="cell-right mono">Amanhã</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </main>
  `,
  styles: [`
    /* ============ PAGE HEADER ============ */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 28px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    .eyebrow {
      display: block;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.2px;
      color: var(--text-tertiary);
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .page-header__title h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: var(--text-strong);
      margin: 0;
    }
    .page-header__right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 11px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--duration) var(--ease);
    }
    .btn-ghost svg { width: 14px; height: 14px; }
    .btn-ghost:hover { border-color: var(--border-strong); color: var(--text-primary); }
    .btn-ghost kbd {
      padding: 1px 5px;
      background: var(--surface-sunken);
      border: 1px solid var(--border);
      border-radius: 3px;
      font-family: var(--font-mono);
      font-size: 10.5px;
      color: var(--text-tertiary);
    }
    .user-chip {
      display: flex; align-items: center; gap: 10px;
      padding: 4px 10px 4px 4px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
    }
    .avatar-square {
      width: 30px; height: 30px;
      background: var(--vivere-orange);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.4px;
    }
    .user-meta { display: flex; flex-direction: column; line-height: 1.2; }
    .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .user-role { font-size: 10.5px; font-weight: 500; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.6px; }

    /* ============ KPI STRIP ============ */
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    .kpi {
      padding: 16px 24px;
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      gap: 4px;
    }
    .kpi:last-child { border-right: 0; }
    .kpi-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: var(--text-tertiary);
    }
    .kpi-value {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-strong);
      letter-spacing: -0.6px;
      line-height: 1.1;
    }
    .kpi-value.danger { color: var(--status-danger); }
    .kpi-trend {
      font-size: 11.5px;
      font-weight: 500;
    }
    .kpi-trend.up { color: var(--status-success); }
    .kpi-trend.warn { color: var(--status-warning); }
    .kpi-trend.danger { color: var(--status-danger); }
    .kpi-trend.muted { color: var(--text-tertiary); }

    /* ============ MAIN GRID ============ */
    .dash-main {
      padding: 20px 28px 28px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .grid-row {
      display: grid;
      gap: 18px;
    }

    /* ============ CARD ============ */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .card__head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .card__title {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      color: var(--text-secondary);
    }
    .card__hint {
      font-size: 11px;
      color: var(--text-tertiary);
    }
    .card__body { padding: 16px; }
    .card__body--flush { padding: 0; }

    .btn-mini {
      padding: 5px 9px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--duration) var(--ease);
    }
    .btn-mini:hover { border-color: var(--text-primary); color: var(--text-primary); }

    /* ============ CALENDAR ============ */
    .cal { border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
    .cal__weekdays {
      display: grid; grid-template-columns: repeat(7,1fr);
      background: var(--surface-sunken);
      border-bottom: 1px solid var(--border);
    }
    .cal__weekdays span {
      padding: 8px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: var(--text-tertiary);
      text-align: center;
    }
    .cal__days { display: grid; grid-template-columns: repeat(7,1fr); }
    .cal-cell {
      min-height: 44px;
      padding: 6px 7px;
      border-right: 1px solid var(--border-subtle);
      border-bottom: 1px solid var(--border-subtle);
      font-size: 12px;
      color: var(--text-secondary);
      position: relative;
    }
    .cal-cell:nth-child(7n) { border-right: 0; }
    .cal-cell.is-empty { background: var(--surface-sunken); color: var(--text-muted); }
    .cal-cell.is-today {
      background: var(--vivere-orange-soft);
      color: var(--vivere-orange);
    }
    .cal-num { font-size: 11.5px; font-weight: 500; }
    .cal-event {
      margin-top: 4px;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 5px;
      background: var(--vivere-orange);
      color: white;
      border-radius: 3px;
      display: inline-block;
      letter-spacing: 0.2px;
    }

    /* ============ DATA TABLE ============ */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .data-table th {
      padding: 10px 16px;
      background: var(--surface-sunken);
      text-align: left;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.7px;
      text-transform: uppercase;
      color: var(--text-tertiary);
      border-bottom: 1px solid var(--border);
    }
    .data-table td {
      padding: 11px 16px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-primary);
    }
    .data-table tbody tr { transition: background var(--duration) var(--ease); }
    .data-table tbody tr:hover { background: var(--surface-hover); }
    .data-table tbody tr:last-child td { border-bottom: 0; }
    .cell-right { text-align: right; }
    .td-strong { font-weight: 500; color: var(--text-primary); }
    .td-sub { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }

    /* ============ BADGES ============ */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      border-radius: var(--radius-sm);
      border: 1px solid;
    }
    .badge--warn { color: var(--status-warning); background: var(--status-warning-bg); border-color: var(--status-warning-border); }
    .badge--success { color: var(--status-success); background: var(--status-success-bg); border-color: var(--status-success-border); }
    .badge--info { color: var(--status-info); background: var(--status-info-bg); border-color: var(--status-info-border); }
    .badge--neutral { color: var(--status-neutral); background: var(--status-neutral-bg); border-color: var(--status-neutral-border); }
    .badge--danger { color: var(--status-danger); background: var(--status-danger-bg); border-color: var(--status-danger-border); }
  `]
})
export class DashboardComponent implements OnInit {
  public router = inject(Router);
  public eventService = inject(EventService);

  calendarDays = [
    -1, 0, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 31
  ];

  ngOnInit() {
    setTimeout(() => this.initStockChart(), 100);
  }

  initStockChart() {
    const ctx = document.getElementById('stockChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Treliças', 'Tendas', 'Praticáveis', 'Cabos'],
          datasets: [
            {
              label: 'Em uso',
              data: [12, 19, 7, 5],
              backgroundColor: '#ff6600',
              borderRadius: 3,
              barThickness: 22
            },
            {
              label: 'Disponível',
              data: [8, 5, 10, 15],
              backgroundColor: '#1a1a1a',
              borderRadius: 3,
              barThickness: 22
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'Inter', weight: 500, size: 11 },
                color: '#525252',
                boxWidth: 10,
                boxHeight: 10,
                padding: 14
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#ededed' },
              ticks: { font: { family: 'JetBrains Mono', size: 11 }, color: '#8a8a8a' }
            },
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Inter', size: 11, weight: 500 }, color: '#525252' }
            }
          }
        }
      });
    }
  }
}