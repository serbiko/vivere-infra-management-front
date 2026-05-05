import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MapComponent, MapMarker } from './components/map/map.component';
import { EventService } from '../../core/services/event.service';
import { MaterialService } from '../../core/services/material.service';
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
          <div class="avatar-square">V</div>
          <div class="user-meta">
            <span class="user-name">Equipe Vivere</span>
            <span class="user-role">Administrador</span>
          </div>
        </div>
      </div>
    </header>

    <section class="kpi-strip">
      <div class="kpi">
        <span class="kpi-label">Eventos ativos</span>
        <span class="kpi-value tnum">{{ totalEventosAtivos }}</span>
        <span class="kpi-trend up">Neste momento</span>
      </div>
      <div class="kpi">
        <span class="kpi-label">Total de Eventos</span>
        <span class="kpi-value tnum">{{ todosEventos.length }}</span>
        <span class="kpi-trend warn">Registrados no banco</span>
      </div>
      <div class="kpi">
        <span class="kpi-label">Materiais Cadastrados</span>
        <span class="kpi-value tnum">{{ totalMateriais }}</span>
        <span class="kpi-trend muted">Itens base no estoque</span>
      </div>
      <div class="kpi">
        <span class="kpi-label">Alertas de estoque</span>
        <span class="kpi-value tnum" [class.danger]="totalMateriaisAlerta > 0">{{ totalMateriaisAlerta }}</span>
        <span class="kpi-trend" [class.danger]="totalMateriaisAlerta > 0">
          {{ totalMateriaisAlerta > 0 ? 'Reposição necessária' : 'Estoque saudável' }}
        </span>
      </div>
    </section>

    <main class="dash-main">
      <div class="grid-row" style="grid-template-columns: 1.4fr 1fr;">
        <article class="card">
          <header class="card__head">
            <span class="card__title">Localização de eventos (Passe o mouse)</span>
            <span class="card__hint">Atualizado agora</span>
          </header>
          <div class="card__body card__body--flush">
            <app-map [viewOnly]="true" [markers]="mapMarkers"></app-map>
          </div>
        </article>

        <article class="card">
          <header class="card__head">
            <span class="card__title">Agenda de montagens — {{ mesAtualTexto }}</span>
            <button class="btn-mini" routerLink="/eventos">Ver tudo</button>
          </header>
          <div class="card__body">
            <div class="cal">
              <div class="cal__weekdays">
                <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
              </div>
              <div class="cal__days">
                <div *ngFor="let d of calendarDays" class="cal-cell"
                  [class.is-today]="d === diaDeHoje"
                  [class.is-empty]="d <= 0">
                  <span class="cal-num mono">{{ d > 0 ? d : '' }}</span>
                  <ng-container *ngIf="d > 0">
                    <div *ngFor="let ev of getEventosDoDia(d)" class="cal-event" [title]="ev.name">
                      {{ ev.name | slice:0:10 }}{{ ev.name.length > 10 ? '...' : '' }}
                    </div>
                  </ng-container>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="grid-row" style="grid-template-columns: 1fr 1.6fr;">
        <article class="card">
          <header class="card__head">
            <span class="card__title">Volume de Estoque (Principais)</span>
          </header>
          <div class="card__body" style="height: 240px; position: relative;">
            <canvas id="stockChart"></canvas>
          </div>
        </article>

        <article class="card">
          <header class="card__head">
            <span class="card__title">Próximas Saídas</span>
            <button class="btn-mini" routerLink="/eventos">Ver agenda completa</button>
          </header>
          <div class="card__body card__body--flush">
        <table class="data-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Status</th>
                  <th class="cell-right">Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ev of eventosProximos">
                  <td>
                    <div class="td-strong">{{ ev.name }}</div>
                  </td>
                  <td>
                    <span class="badge" 
                          [ngClass]="{
                            'badge--warn': ev.status === 'PENDING',
                            'badge--info': ev.status === 'ACTIVE',
                            'badge--success': ev.status === 'FINISHED' || ev.status === 'READY',
                            'badge--neutral': ev.status === 'DRAFT'
                          }">
                      {{ ev.status }}
                    </span>
                  </td>
                  <td class="cell-right mono">{{ ev.startDate | date:'dd/MM HH:mm' }}</td>
                </tr>
                <tr *ngIf="eventosProximos.length === 0">
                  <td colspan="3" style="text-align:center; padding: 30px; color: #888;">
                    Nenhum evento registrado no sistema.
                  </td>
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
    .page-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 28px; background: var(--surface); border-bottom: 1px solid var(--border); }
    .eyebrow { display: block; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 3px; }
    .page-header__title h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; color: var(--text-strong); margin: 0; }
    .page-header__right { display: flex; align-items: center; gap: 12px; }
    .btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 7px 11px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-secondary); font-size: 13px; font-weight: 500; cursor: pointer; transition: all var(--duration) var(--ease); }
    .btn-ghost svg { width: 14px; height: 14px; }
    .btn-ghost:hover { border-color: var(--border-strong); color: var(--text-primary); }
    .btn-ghost kbd { padding: 1px 5px; background: var(--surface-sunken); border: 1px solid var(--border); border-radius: 3px; font-family: var(--font-mono); font-size: 10.5px; color: var(--text-tertiary); }
    .user-chip { display: flex; align-items: center; gap: 10px; padding: 4px 10px 4px 4px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
    .avatar-square { width: 30px; height: 30px; background: var(--vivere-orange); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 700; letter-spacing: 0.4px; }
    .user-meta { display: flex; flex-direction: column; line-height: 1.2; }
    .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .user-role { font-size: 10.5px; font-weight: 500; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.6px; }

    /* ============ KPI STRIP ============ */
    .kpi-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; background: var(--surface); border-bottom: 1px solid var(--border); }
    .kpi { padding: 16px 24px; border-right: 1px solid var(--border); display: flex; flex-direction: column; gap: 4px; }
    .kpi:last-child { border-right: 0; }
    .kpi-label { font-size: 11px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; color: var(--text-tertiary); }
    .kpi-value { font-size: 26px; font-weight: 700; color: var(--text-strong); letter-spacing: -0.6px; line-height: 1.1; }
    .kpi-value.danger { color: var(--status-danger); }
    .kpi-trend { font-size: 11.5px; font-weight: 500; }
    .kpi-trend.up { color: var(--status-success); }
    .kpi-trend.warn { color: var(--status-warning); }
    .kpi-trend.danger { color: var(--status-danger); }
    .kpi-trend.muted { color: var(--text-tertiary); }

    /* ============ MAIN GRID ============ */
    .dash-main { padding: 20px 28px 28px; display: flex; flex-direction: column; gap: 18px; }
    .grid-row { display: grid; gap: 18px; }

    /* ============ CARD ============ */
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .card__head { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); }
    .card__title { font-size: 12px; font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase; color: var(--text-secondary); }
    .card__hint { font-size: 11px; color: var(--text-tertiary); }
    .card__body { padding: 16px; }
    .card__body--flush { padding: 0; }

    .btn-mini { padding: 5px 9px; background: transparent; border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 11.5px; font-weight: 500; cursor: pointer; transition: all var(--duration) var(--ease); }
    .btn-mini:hover { border-color: var(--text-primary); color: var(--text-primary); }

    /* ============ CALENDAR ============ */
    .cal { border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
    .cal__weekdays { display: grid; grid-template-columns: repeat(7,1fr); background: var(--surface-sunken); border-bottom: 1px solid var(--border); }
    .cal__weekdays span { padding: 8px; font-size: 10px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text-tertiary); text-align: center; }
    .cal__days { display: grid; grid-template-columns: repeat(7,1fr); }
    .cal-cell { min-height: 50px; padding: 6px 7px; border-right: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-secondary); position: relative; }
    .cal-cell:nth-child(7n) { border-right: 0; }
    .cal-cell.is-empty { background: var(--surface-sunken); color: var(--text-muted); }
    .cal-cell.is-today { background: var(--vivere-orange-soft); color: var(--vivere-orange); }
    .cal-num { font-size: 11.5px; font-weight: 500; }
    .cal-event { margin-top: 4px; font-size: 10px; font-weight: 600; padding: 2px 4px; background: var(--vivere-orange); color: white; border-radius: 3px; display: inline-block; letter-spacing: 0.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

    /* ============ DATA TABLE ============ */
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table th { padding: 10px 16px; background: var(--surface-sunken); text-align: left; font-size: 10.5px; font-weight: 600; letter-spacing: 0.7px; text-transform: uppercase; color: var(--text-tertiary); border-bottom: 1px solid var(--border); }
    .data-table td { padding: 11px 16px; border-bottom: 1px solid var(--border-subtle); color: var(--text-primary); }
    .data-table tbody tr { transition: background var(--duration) var(--ease); }
    .data-table tbody tr:hover { background: var(--surface-hover); }
    .data-table tbody tr:last-child td { border-bottom: 0; }
    .cell-right { text-align: right; }
    .td-strong { font-weight: 500; color: var(--text-primary); }
    .td-sub { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }

    /* ============ BADGES ============ */
    .badge { display: inline-block; padding: 2px 8px; font-size: 10.5px; font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase; border-radius: var(--radius-sm); border: 1px solid; }
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
  public materialService = inject(MaterialService);

  totalEventosAtivos = 0;
  totalMateriais = 0;
  totalMateriaisAlerta = 0;
  
  todosEventos: any[] = [];
  eventosProximos: any[] = [];
  mapMarkers: MapMarker[] = [];
  
  chartInstance: any;
  hoje = new Date();
  diaDeHoje = this.hoje.getDate();
  mesAtualTexto = '';
  calendarDays: number[] = [];

  ngOnInit() {
    this.gerarCalendarioDoMes();
    this.carregarDadosReais();
  }

  gerarCalendarioDoMes() {
    const year = this.hoje.getFullYear();
    const month = this.hoje.getMonth();
    const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    this.mesAtualTexto = `${nomesMeses[month]}/${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.calendarDays = [];
    for (let i = 0; i < firstDay; i++) this.calendarDays.push(-i);
    for (let i = 1; i <= daysInMonth; i++) this.calendarDays.push(i);
    while (this.calendarDays.length % 7 !== 0) this.calendarDays.push(-100); 
  }

  carregarDadosReais() {
    this.eventService.getEvents().subscribe((eventos) => {
      this.todosEventos = eventos;
      
      const ativos = eventos.filter(e => e.status === 'ACTIVE' || e.status === 'PENDING');
      this.totalEventosAtivos = ativos.length;

      this.eventosProximos = eventos
        .filter(e => e.status !== 'FINISHED' && e.status !== 'CANCELLED')
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 4);

      this.mapMarkers = ativos.filter(e => e.latitude && e.longitude).map(e => {
        const dataStr = new Date(e.startDate).toLocaleDateString('pt-BR');
        const statusTraduzido = e.status === 'PENDING' ? 'Pendente/Planejamento' : 'Em andamento';

        return {
          lat: e.latitude,
          lng: e.longitude,
          title: e.name,
          info: `Status: <b>${statusTraduzido}</b><br>Data: ${dataStr}`
        };
      });
    });

    this.materialService.getMaterials().subscribe((materiais) => {
      this.totalMateriais = materiais.length;
      this.totalMateriaisAlerta = materiais.filter(m => m.stock < 10).length;
      this.gerarGraficoMateriais(materiais);
    });
  }

  getEventosDoDia(dia: number): any[] {
    if (dia <= 0) return [];
    return this.todosEventos.filter(ev => {
      const dataEvento = new Date(ev.startDate);
      return dataEvento.getDate() === dia && 
             dataEvento.getMonth() === this.hoje.getMonth() && 
             dataEvento.getFullYear() === this.hoje.getFullYear();
    });
  }

  gerarGraficoMateriais(materiais: any[]) {
    const topMateriais = materiais.slice(0, 6);
    const labelsMateriais = topMateriais.map(m => m.name.substring(0, 15));
    const quantidades = topMateriais.map(m => m.stock);

    const ctx = document.getElementById('stockChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.chartInstance) this.chartInstance.destroy();
      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labelsMateriais,
          datasets: [{
            label: 'Unidades em Estoque Base',
            data: quantidades,
            backgroundColor: '#ff6600',
            borderRadius: 3,
            barThickness: 22
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', weight: 500, size: 11 }, color: '#525252' } } },
          scales: { y: { beginAtZero: true, grid: { color: '#ededed' } }, x: { grid: { display: false } } }
        }
      });
    }
  }
}