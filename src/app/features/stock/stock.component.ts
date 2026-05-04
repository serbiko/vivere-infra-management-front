import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Material {
  id: string;
  nome: string;
  total: number;
  emUso: number;
  disponivel: number;
  unidade: string;
}

interface EstruturaGabarito {
  id: string;
  nome: string;
  materiais: { nome: string; qtdNecessaria: number; unidade: string }[];
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header">
      <div class="page-header__title">
        <span class="eyebrow">Inventário</span>
        <h1>Estoque e estruturas</h1>
        <p class="subtitle">Inventário global e gabaritos de composição.</p>
      </div>
      <div class="page-header__right">
        <button class="btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar inventário
        </button>
        <button class="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo material
        </button>
      </div>
    </header>

    <div class="filter-tabs">
      <button [class.is-active]="tab === 'inventario'" (click)="tab = 'inventario'">
        Inventário global
      </button>
      <button [class.is-active]="tab === 'gabarito'" (click)="tab = 'gabarito'">
        Gabaritos de estruturas
      </button>
    </div>

    <main class="stock-main">
      <!-- ================== INVENTÁRIO ================== -->
      <div *ngIf="tab === 'inventario'">
        <section class="kpi-strip-card">
          <div class="kpi-cell">
            <span class="kpi-label">Itens ativos em campo</span>
            <span class="kpi-value tnum">452</span>
            <span class="kpi-trend muted">de 1.250 totais</span>
          </div>
          <div class="kpi-cell">
            <span class="kpi-label">Categorias monitoradas</span>
            <span class="kpi-value tnum">14</span>
            <span class="kpi-trend muted">3 estruturais, 11 acessórios</span>
          </div>
          <div class="kpi-cell">
            <span class="kpi-label">Alertas de reposição</span>
            <span class="kpi-value tnum danger">3</span>
            <span class="kpi-trend danger">Estoque crítico</span>
          </div>
          <div class="kpi-cell">
            <span class="kpi-label">Última auditoria</span>
            <span class="kpi-value tnum" style="font-size: 18px;">12/04</span>
            <span class="kpi-trend muted">há 22 dias</span>
          </div>
        </section>

        <article class="card no-padding">
          <header class="card__head">
            <span class="card__title">Materiais cadastrados</span>
            <div class="search-mini">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Buscar material..." />
            </div>
          </header>

          <table class="data-table data-table--full">
            <thead>
              <tr>
                <th>Material</th>
                <th class="cell-center">Unidade</th>
                <th class="cell-right">Total</th>
                <th class="cell-right">Em uso</th>
                <th class="cell-right">Disponível</th>
                <th>Ocupação</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of inventario()">
                <td>
                  <div class="td-strong">{{ item.nome }}</div>
                  <div class="td-sub mono">ID: {{ item.id }}</div>
                </td>
                <td class="cell-center mono">{{ item.unidade }}</td>
                <td class="cell-right mono">{{ item.total }}</td>
                <td class="cell-right mono">{{ item.emUso }}</td>
                <td class="cell-right mono"
                    [style.color]="item.disponivel < 10 ? 'var(--status-danger)' : 'var(--text-primary)'"
                    [style.fontWeight]="item.disponivel < 10 ? '600' : '500'">
                  {{ item.disponivel }}
                </td>
                <td style="width: 160px;">
                  <div class="progress">
                    <div class="progress__bar"
                         [style.width.%]="(item.emUso / item.total) * 100"
                         [class.is-danger]="item.disponivel < 10"></div>
                  </div>
                  <span class="progress__text mono">{{ ((item.emUso / item.total) * 100) | number:'1.0-0' }}%</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="item.disponivel < 10 ? 'badge--danger' : 'badge--success'">
                    {{ item.disponivel < 10 ? 'Estoque baixo' : 'Estável' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </article>
      </div>

      <!-- ================== GABARITOS ================== -->
      <div *ngIf="tab === 'gabarito'" class="gabarito-grid">
        <aside class="gabarito-sidebar card">
          <header class="card__head">
            <span class="card__title">Selecione o gabarito</span>
          </header>
          <div class="gabarito-list">
            <button *ngFor="let est of gabaritos()"
                    class="gabarito-item"
                    [class.is-selected]="estSelecionada?.id === est.id"
                    (click)="selecionarEstrutura(est)">
              <div class="gabarito-item__id mono">{{ est.id }}</div>
              <div class="gabarito-item__name">{{ est.nome }}</div>
              <svg class="gabarito-item__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <button class="gabarito-item gabarito-item--add">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Nova estrutura</span>
            </button>
          </div>
        </aside>

        <article class="card gabarito-detail" *ngIf="estSelecionada; else emptyDetail">
          <header class="card__head">
            <div>
              <span class="detail-eyebrow mono">{{ estSelecionada.id }}</span>
              <h2 class="detail-title">{{ estSelecionada.nome }}</h2>
            </div>
            <div class="detail-actions">
              <button class="btn-secondary">Duplicar</button>
              <button class="btn-primary">Editar composição</button>
            </div>
          </header>

          <p class="detail-hint">
            Materiais que compõem <strong>1 unidade</strong> desta estrutura. Estes dados alimentam a OS automaticamente.
          </p>

          <table class="data-table inline-table">
            <thead>
              <tr>
                <th>Material necessário</th>
                <th class="cell-right">Quantidade</th>
                <th class="cell-center">Unidade</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let mat of estSelecionada.materiais">
                <td class="td-strong">{{ mat.nome }}</td>
                <td class="cell-right mono">{{ mat.qtdNecessaria }}</td>
                <td class="cell-center mono td-muted">{{ mat.unidade }}</td>
              </tr>
            </tbody>
          </table>
        </article>

        <ng-template #emptyDetail>
          <article class="card gabarito-detail">
            <div class="empty-block">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <p>Selecione um gabarito ao lado</p>
              <span>A composição de materiais aparecerá aqui.</span>
            </div>
          </article>
        </ng-template>
      </div>
    </main>
  `,
  styles: [`
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 18px 28px; background: var(--surface); border-bottom: 1px solid var(--border);
    }
    .eyebrow { display: block; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 3px; }
    .page-header__title h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; color: var(--text-strong); margin: 0; }
    .page-header__title .subtitle { margin: 4px 0 0; font-size: 13px; color: var(--text-secondary); }
    .page-header__right { display: flex; gap: 8px; }

    .btn-primary, .btn-secondary {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 8px 13px; border-radius: var(--radius);
      font-size: 13px; font-weight: 500;
      cursor: pointer;
      transition: all var(--duration) var(--ease);
    }
    .btn-primary svg, .btn-secondary svg { width: 14px; height: 14px; }
    .btn-primary { background: var(--vivere-orange); color: white; border: 1px solid var(--vivere-orange); }
    .btn-primary:hover { background: var(--vivere-orange-hover); border-color: var(--vivere-orange-hover); }
    .btn-secondary { background: var(--surface); color: var(--text-primary); border: 1px solid var(--border); }
    .btn-secondary:hover { border-color: var(--border-strong); background: var(--surface-hover); }

    /* TABS */
    .filter-tabs {
      display: flex; gap: 0;
      padding: 0 28px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    .filter-tabs button {
      padding: 12px 14px;
      background: transparent;
      border: 0;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-tertiary);
      cursor: pointer;
      transition: color var(--duration) var(--ease), border-color var(--duration) var(--ease);
    }
    .filter-tabs button:hover { color: var(--text-primary); }
    .filter-tabs button.is-active { color: var(--text-strong); border-bottom-color: var(--vivere-orange); }

    /* MAIN */
    .stock-main {
      padding: 20px 28px 28px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* KPI STRIP */
    .kpi-strip-card {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .kpi-cell {
      padding: 14px 18px;
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column; gap: 3px;
    }
    .kpi-cell:last-child { border-right: 0; }
    .kpi-label { font-size: 11px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; color: var(--text-tertiary); }
    .kpi-value { font-size: 24px; font-weight: 700; color: var(--text-strong); letter-spacing: -0.5px; line-height: 1.1; }
    .kpi-value.danger { color: var(--status-danger); }
    .kpi-trend { font-size: 11.5px; font-weight: 500; }
    .kpi-trend.danger { color: var(--status-danger); }
    .kpi-trend.muted { color: var(--text-tertiary); }

    /* CARD */
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
    .card.no-padding { padding: 0; overflow: hidden; }
    .card__head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .card__title {
      font-size: 12px; font-weight: 600; letter-spacing: 0.4px;
      text-transform: uppercase; color: var(--text-secondary);
    }

    .search-mini {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--surface);
      transition: border-color var(--duration) var(--ease);
    }
    .search-mini:focus-within { border-color: var(--vivere-orange); box-shadow: 0 0 0 3px rgba(255,102,0,0.10); }
    .search-mini svg { width: 13px; height: 13px; color: var(--text-tertiary); }
    .search-mini input {
      border: 0; outline: 0; background: transparent;
      font-size: 12.5px;
      width: 180px;
      color: var(--text-primary);
    }
    .search-mini input::placeholder { color: var(--text-muted); }

    /* TABLE */
    .data-table--full { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table--full th {
      padding: 10px 14px;
      background: var(--surface-sunken);
      text-align: left;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.7px;
      text-transform: uppercase;
      color: var(--text-tertiary);
      border-bottom: 1px solid var(--border);
    }
    .data-table--full td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-primary);
      vertical-align: middle;
    }
    .data-table--full tbody tr { transition: background var(--duration) var(--ease); }
    .data-table--full tbody tr:hover { background: var(--surface-hover); }
    .data-table--full tbody tr:last-child td { border-bottom: 0; }

    .cell-right { text-align: right; }
    .cell-center { text-align: center; }
    .td-strong { font-weight: 500; color: var(--text-primary); }
    .td-sub { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }
    .td-muted { color: var(--text-tertiary); }
    .mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 12.5px; }

    /* PROGRESS */
    .progress {
      display: inline-block;
      width: 110px; height: 6px;
      background: var(--surface-sunken);
      border-radius: 3px;
      overflow: hidden;
      vertical-align: middle;
    }
    .progress__bar {
      height: 100%;
      background: var(--vivere-orange);
      transition: width var(--duration-slow) var(--ease);
    }
    .progress__bar.is-danger { background: var(--status-danger); }
    .progress__text {
      display: inline-block;
      margin-left: 8px;
      font-size: 11.5px;
      color: var(--text-tertiary);
      vertical-align: middle;
    }

    /* BADGES */
    .badge {
      display: inline-block; padding: 2px 8px;
      font-size: 10.5px; font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase;
      border-radius: var(--radius-sm); border: 1px solid;
    }
    .badge--danger { color: var(--status-danger); background: var(--status-danger-bg); border-color: var(--status-danger-border); }
    .badge--success { color: var(--status-success); background: var(--status-success-bg); border-color: var(--status-success-border); }

    /* ============ GABARITOS ============ */
    .gabarito-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 18px;
      align-items: start;
    }
    .gabarito-sidebar { padding: 0; }
    .gabarito-list { padding: 8px; display: flex; flex-direction: column; gap: 2px; }

    .gabarito-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius);
      cursor: pointer;
      text-align: left;
      transition: all var(--duration) var(--ease);
      position: relative;
    }
    .gabarito-item__id {
      padding: 2px 7px;
      background: var(--surface-sunken);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 10.5px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .gabarito-item__name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }
    .gabarito-item__chevron {
      width: 14px; height: 14px;
      color: var(--text-muted);
      transition: transform var(--duration) var(--ease);
    }
    .gabarito-item:hover {
      background: var(--surface-hover);
      border-color: var(--border-subtle);
    }
    .gabarito-item:hover .gabarito-item__chevron { transform: translateX(2px); color: var(--text-secondary); }
    .gabarito-item.is-selected {
      background: var(--vivere-orange-soft);
      border-color: var(--vivere-orange-border);
    }
    .gabarito-item.is-selected::before {
      content: '';
      position: absolute;
      left: -1px; top: 8px; bottom: 8px;
      width: 2px;
      background: var(--vivere-orange);
      border-radius: 0 2px 2px 0;
    }
    .gabarito-item.is-selected .gabarito-item__id {
      background: var(--surface);
      border-color: var(--vivere-orange-border);
      color: var(--vivere-orange);
    }
    .gabarito-item.is-selected .gabarito-item__chevron { color: var(--vivere-orange); }

    .gabarito-item--add {
      display: flex; align-items: center; justify-content: center;
      gap: 6px;
      margin-top: 6px;
      padding: 10px;
      border: 1px dashed var(--border-strong);
      color: var(--text-tertiary);
      font-size: 12.5px;
      font-weight: 500;
    }
    .gabarito-item--add svg { width: 14px; height: 14px; }
    .gabarito-item--add:hover {
      border-color: var(--vivere-orange);
      border-style: dashed;
      background: var(--vivere-orange-soft);
      color: var(--vivere-orange);
    }

    /* GABARITO DETAIL */
    .gabarito-detail { padding: 0; }
    .gabarito-detail .card__head {
      align-items: flex-start;
      padding: 16px;
    }
    .detail-eyebrow {
      display: inline-block;
      padding: 2px 7px;
      background: var(--vivere-orange-soft);
      border: 1px solid var(--vivere-orange-border);
      color: var(--vivere-orange);
      font-size: 10.5px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      margin-bottom: 5px;
    }
    .detail-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-strong);
      letter-spacing: -0.2px;
    }
    .detail-actions { display: flex; gap: 8px; }
    .detail-hint {
      margin: 0;
      padding: 12px 16px;
      background: var(--surface-sunken);
      border-bottom: 1px solid var(--border-subtle);
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .detail-hint strong { color: var(--text-primary); font-weight: 600; }

    .inline-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .inline-table th {
      padding: 10px 16px;
      text-align: left;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.7px;
      text-transform: uppercase;
      color: var(--text-tertiary);
      border-bottom: 1px solid var(--border-subtle);
    }
    .inline-table td {
      padding: 11px 16px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-primary);
    }
    .inline-table tr:last-child td { border-bottom: 0; }

    .empty-block {
      padding: 80px 20px;
      text-align: center;
      color: var(--text-tertiary);
    }
    .empty-block svg {
      width: 36px; height: 36px;
      color: var(--text-muted);
      padding: 12px;
      background: var(--surface-sunken);
      border: 1px solid var(--border);
      border-radius: 50%;
      box-sizing: content-box;
      margin: 0 auto 14px;
      display: block;
    }
    .empty-block p { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .empty-block span { font-size: 12.5px; }

    @media (max-width: 1100px) {
      .gabarito-grid { grid-template-columns: 1fr; }
      .kpi-strip-card { grid-template-columns: repeat(2, 1fr); }
      .kpi-cell:nth-child(2) { border-right: 0; }
      .kpi-cell:nth-child(1), .kpi-cell:nth-child(2) { border-bottom: 1px solid var(--border); }
    }
  `]
})
export class StockComponent {
  tab = 'inventario';
  estSelecionada: EstruturaGabarito | null = null;

  inventario = signal<Material[]>([
    { id: '1', nome: 'Treliça Box Truss Q25 2m', total: 50, emUso: 30, disponivel: 20, unidade: 'UN' },
    { id: '2', nome: 'Parafuso Sextavado 3/8', total: 1000, emUso: 400, disponivel: 600, unidade: 'UN' },
    { id: '3', nome: 'Cabo de Aço 5mm (Rolo)', total: 200, emUso: 195, disponivel: 5, unidade: 'MT' },
  ]);

  gabaritos = signal<EstruturaGabarito[]>([
    {
      id: 'T10',
      nome: 'TENDA 10X10 PIRAMIDAL',
      materiais: [
        { nome: 'Lona de Cobertura 10x10', qtdNecessaria: 1, unidade: 'UN' },
        { nome: 'Cabo de Aço Estirante', qtdNecessaria: 4, unidade: 'UN' },
        { nome: 'Estacas de Ferro 1m', qtdNecessaria: 8, unidade: 'UN' },
        { nome: 'Treliça de Sustentação', qtdNecessaria: 4, unidade: 'UN' }
      ]
    },
    {
      id: 'P43',
      nome: 'PALCO PRATICÁVEL 4X3M',
      materiais: [
        { nome: 'Praticável 2x1m Telescópico', qtdNecessaria: 6, unidade: 'UN' },
        { nome: 'Escada de Acesso 3 Degraus', qtdNecessaria: 1, unidade: 'UN' },
        { nome: 'Saia de Palco em Brim Preto', qtdNecessaria: 1, unidade: 'UN' }
      ]
    }
  ]);

  selecionarEstrutura(est: EstruturaGabarito) {
    this.estSelecionada = est;
  }
}