import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService, VivereEvent } from '../../../core/services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header">
      <div class="page-header__title">
        <span class="eyebrow">Operação</span>
        <h1>Gestão de eventos</h1>
        <p class="subtitle">Controle de montagens sincronizado com o banco de dados.</p>
      </div>
      <div class="page-header__right">
        <button class="btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar
        </button>
        <button class="btn-primary" (click)="router.navigate(['/ordens'])">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo planejamento (OS)
        </button>
      </div>
    </header>

    <div class="filter-tabs">
      <button [class.is-active]="filter === 'ALL'" (click)="filter = 'ALL'">
        Todos <span class="count tnum">{{ events().length }}</span>
      </button>
      <button [class.is-active]="filter === 'PENDING'" (click)="filter = 'PENDING'">
        Planejamento <span class="count tnum">{{ countByStatus('PENDING') }}</span>
      </button>
      <button [class.is-active]="filter === 'IN_PROGRESS'" (click)="filter = 'IN_PROGRESS'">
        Em montagem <span class="count tnum">{{ countByStatus('IN_PROGRESS') }}</span>
      </button>
      <button [class.is-active]="filter === 'COMPLETED'" (click)="filter = 'COMPLETED'">
        Finalizados <span class="count tnum">{{ countByStatus('COMPLETED') }}</span>
      </button>
    </div>

    <main class="list-main">
      <div class="card no-padding">
        <table class="data-table data-table--full">
          <thead>
            <tr>
              <th class="col-status"></th>
              <th>Evento / projeto</th>
              <th>Status</th>
              <th class="col-date">Data início</th>
              <th>Local</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let event of filteredEvents()" (click)="abrirEdicao(event)" class="row-clickable">
              <td class="col-status">
                <span class="status-dot" [ngClass]="event.status.toLowerCase()"></span>
              </td>
              <td>
                <div class="td-strong">{{ event.name }}</div>
                <div class="td-sub">{{ event.description || 'Sem descrição detalhada.' }}</div>
              </td>
              <td>
                <span class="badge" [ngClass]="badgeClass(event.status)">{{ statusLabel(event.status) }}</span>
              </td>
              <td class="col-date mono">{{ event.startDate | date:'dd/MM/yyyy' }}</td>
              <td class="td-muted">{{ event.local || '—' }}</td>
              <td class="col-actions">
                <button class="btn-icon" (click)="abrirEdicao(event); $event.stopPropagation()" title="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="filteredEvents().length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h3>Nenhum evento encontrado</h3>
          <p>Não há registros para este filtro.</p>
        </div>
      </div>
    </main>

    <div *ngIf="editForm" class="modal-overlay" (click)="editForm = null">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal__head">
          <div>
            <span class="modal__eyebrow">Editar registro</span>
            <h3>{{ editForm.name }}</h3>
          </div>
          <button class="btn-close" (click)="editForm = null" aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </header>

        <div class="modal__body">
          <div class="field">
            <label>Nome do evento / projeto</label>
            <input [(ngModel)]="editForm.name" />
          </div>

          <div class="field-grid">
            <div class="field">
              <label>Status logístico</label>
              <select [(ngModel)]="editForm.status">
                <option value="PENDING">Planejamento</option>
                <option value="IN_PROGRESS">Em montagem</option>
                <option value="COMPLETED">Finalizado</option>
              </select>
            </div>
            <div class="field">
              <label>Data início</label>
              <input type="date"
                [ngModel]="editForm.startDate | date:'yyyy-MM-dd'"
                (ngModelChange)="editForm.startDate=$event" />
            </div>
          </div>

          <div class="field">
            <label>Observações da OS / carga (Apenas Local)</label>
            <textarea [(ngModel)]="editForm.description" rows="4" placeholder="O backend ainda não salva este campo."></textarea>
          </div>
        </div>

        <footer class="modal__foot">
          <button class="btn-secondary" (click)="editForm = null">Cancelar</button>
          <button class="btn-primary" (click)="salvarAlteracoes()">Salvar alterações</button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    /* Reaproveita .page-header / .eyebrow do dashboard, mas adicionamos as variantes que o list precisa */
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 18px 28px; background: var(--surface); border-bottom: 1px solid var(--border);
    }
    .page-header__title h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; color: var(--text-strong); margin: 0; }
    .page-header__title .subtitle { margin: 4px 0 0; font-size: 13px; color: var(--text-secondary); }
    .eyebrow { display: block; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 3px; }
    .page-header__right { display: flex; gap: 8px; }

    .btn-primary, .btn-secondary {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 8px 13px; border-radius: var(--radius);
      font-size: 13px; font-weight: 500;
      cursor: pointer;
      transition: all var(--duration) var(--ease);
    }
    .btn-primary svg, .btn-secondary svg { width: 14px; height: 14px; }
    .btn-primary {
      background: var(--vivere-orange); color: white;
      border: 1px solid var(--vivere-orange);
    }
    .btn-primary:hover { background: var(--vivere-orange-hover); border-color: var(--vivere-orange-hover); }
    .btn-secondary {
      background: var(--surface); color: var(--text-primary);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover { border-color: var(--border-strong); background: var(--surface-hover); }

    /* ============ FILTER TABS ============ */
    .filter-tabs {
      display: flex; gap: 0;
      padding: 0 28px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    .filter-tabs button {
      display: inline-flex; align-items: center; gap: 8px;
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
    .filter-tabs button.is-active {
      color: var(--text-strong);
      border-bottom-color: var(--vivere-orange);
    }
    .count {
      padding: 1px 6px;
      background: var(--surface-sunken);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 10.5px;
      font-weight: 600;
      color: var(--text-tertiary);
    }
    .filter-tabs button.is-active .count { background: var(--vivere-orange-soft); color: var(--vivere-orange); border-color: var(--vivere-orange-border); }

    /* ============ LIST ============ */
    .list-main { padding: 20px 28px 28px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
    .card.no-padding { padding: 0; overflow: hidden; }

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
      padding: 14px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-primary);
      vertical-align: middle;
    }
    .data-table--full tbody tr.row-clickable {
      cursor: pointer;
      transition: background var(--duration) var(--ease);
    }
    .data-table--full tbody tr:hover { background: var(--surface-hover); }
    .data-table--full tbody tr:last-child td { border-bottom: 0; }

    .col-status { width: 32px; padding-left: 18px !important; }
    .col-date { white-space: nowrap; color: var(--text-secondary); }
    .col-actions { width: 50px; text-align: right; padding-right: 18px !important; }

    .status-dot {
      display: inline-block;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--text-muted);
    }
    .status-dot.pending { background: var(--vivere-orange); box-shadow: 0 0 0 3px var(--vivere-orange-soft); }
    .status-dot.in_progress { background: var(--status-info); box-shadow: 0 0 0 3px var(--status-info-bg); }
    .status-dot.completed { background: var(--status-success); box-shadow: 0 0 0 3px var(--status-success-bg); }

    .td-strong { font-weight: 500; color: var(--text-primary); }
    .td-sub { font-size: 12px; color: var(--text-tertiary); margin-top: 2px;
      max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .td-muted { color: var(--text-tertiary); }
    .mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 12.5px; }

    .badge {
      display: inline-block; padding: 2px 8px;
      font-size: 10.5px; font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase;
      border-radius: var(--radius-sm); border: 1px solid;
    }
    .badge.pending { color: var(--vivere-orange); background: var(--vivere-orange-soft); border-color: var(--vivere-orange-border); }
    .badge.in_progress { color: var(--status-info); background: var(--status-info-bg); border-color: var(--status-info-border); }
    .badge.completed { color: var(--status-success); background: var(--status-success-bg); border-color: var(--status-success-border); }

    .btn-icon {
      width: 30px; height: 30px;
      display: inline-flex; align-items: center; justify-content: center;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      color: var(--text-tertiary);
      cursor: pointer;
      transition: all var(--duration) var(--ease);
    }
    .btn-icon svg { width: 14px; height: 14px; }
    .btn-icon:hover { background: var(--surface-sunken); border-color: var(--border); color: var(--text-primary); }

    .empty-state {
      padding: 80px 20px;
      text-align: center;
      color: var(--text-tertiary);
    }
    .empty-state svg {
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
    .empty-state h3 { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .empty-state p { margin: 0; font-size: 13px; }

    /* ============ MODAL ============ */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(15,15,15,0.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 3000;
      backdrop-filter: blur(2px);
      animation: fadeIn 150ms var(--ease);
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal {
      width: 560px; max-width: calc(100% - 40px);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-modal);
      display: flex; flex-direction: column;
      animation: scaleIn 150ms var(--ease);
    }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
    .modal__head {
      padding: 18px 22px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: flex-start; justify-content: space-between;
    }
    .modal__eyebrow {
      display: block;
      font-size: 10.5px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase;
      color: var(--vivere-orange);
      margin-bottom: 4px;
    }
    .modal__head h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-strong); }
    .btn-close {
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      background: transparent; border: 1px solid transparent;
      border-radius: var(--radius-sm);
      color: var(--text-tertiary);
      cursor: pointer;
      transition: all var(--duration) var(--ease);
    }
    .btn-close:hover { background: var(--surface-sunken); color: var(--text-primary); border-color: var(--border); }
    .btn-close svg { width: 16px; height: 16px; }

    .modal__body {
      padding: 20px 22px;
      display: flex; flex-direction: column; gap: 16px;
    }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label {
      font-size: 11.5px; font-weight: 600; letter-spacing: 0.5px;
      text-transform: uppercase; color: var(--text-secondary);
    }
    .field input, .field select, .field textarea {
      padding: 9px 11px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      font-size: 13.5px;
      color: var(--text-primary);
      transition: border-color var(--duration) var(--ease), box-shadow var(--duration) var(--ease);
      resize: vertical;
    }
    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none;
      border-color: var(--vivere-orange);
      box-shadow: 0 0 0 3px rgba(255,102,0,0.12);
    }
    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    .modal__foot {
      padding: 14px 22px;
      border-top: 1px solid var(--border);
      background: var(--surface-sunken);
      display: flex; justify-content: flex-end; gap: 8px;
    }
  `]
})
export class EventListComponent implements OnInit {
  private eventService = inject(EventService);
  public router = inject(Router);

  filter = 'ALL';
  events = signal<VivereEvent[]>([]);
  editForm: VivereEvent | null = null;

  ngOnInit() { this.loadEvents(); }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (data) => this.events.set(data),
      error: (err) => console.error('Erro ao carregar eventos:', err)
    });
  }

  filteredEvents() {
    if (this.filter === 'ALL') return this.events();
    return this.events().filter(e => e.status === this.filter);
  }

  countByStatus(status: string): number {
    return this.events().filter(e => e.status === status).length;
  }

  statusLabel(status: string): string {
    return ({
      'PENDING': 'Planejamento',
      'IN_PROGRESS': 'Em montagem',
      'COMPLETED': 'Finalizado',
      'ACTIVE': 'Ativo',
      'FINISHED': 'Finalizado'
    } as Record<string, string>)[status] || status;
  }

  badgeClass(status: string): string {
    return status.toLowerCase();
  }

  abrirEdicao(event: VivereEvent) {
    this.editForm = { ...event };
  }

  salvarAlteracoes() {
    if (this.editForm && this.editForm.id) {
      
      let startStr = this.editForm.startDate as string;
      if (!startStr.includes('T')) startStr += 'T12:00:00';

      const payloadLimpo = {
        name: this.editForm.name,
        status: this.editForm.status,
        startDate: new Date(startStr).toISOString()
      };

      this.eventService.updateEvent(this.editForm.id, payloadLimpo).subscribe({
        next: () => {
          alert('✅ Banco de Dados atualizado com sucesso!');
          this.editForm = null;
          this.loadEvents();
        },
        error: (err: any) => alert('❌ Erro ao salvar: ' + err.message)
      });
    }
  }
}