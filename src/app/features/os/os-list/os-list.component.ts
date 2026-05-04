import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MapComponent } from '../../dashboard/components/map/map.component';
import { EventService } from '../../../core/services/event.service';
import { MaterialService } from '../../../core/services/material.service';
import { ServiceOrderService } from '../../../core/services/service-order.service';

@Component({
  selector: 'app-os-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  template: `
    <header class="page-header">
      <div class="page-header__title">
        <span class="eyebrow">Documento operacional</span>
        <h1>Nova ordem de serviço</h1>
        <p class="subtitle">Carga, montagem e logística do evento.</p>
      </div>
      <div class="page-header__right">
        <div class="meta-pill">
          <span class="meta-pill__label">Emissão</span>
          <span class="meta-pill__value mono">{{ today | date:'dd/MM/yyyy' }}</span>
        </div>
        <div class="meta-pill">
          <span class="meta-pill__label">Nº</span>
          <span class="meta-pill__value mono">OS-{{ today | date:'yyyy' }}-RASCUNHO</span>
        </div>
      </div>
    </header>

    <main class="os-page">
      <section class="os-doc">
        <!-- ======== SEÇÃO 1: DADOS ======== -->
        <div class="os-section">
          <div class="os-section__head">
            <span class="os-section__num">01</span>
            <div>
              <h2>Dados do evento</h2>
              <p>Identificação, responsável e janela de execução.</p>
            </div>
          </div>

          <div class="os-grid">
            <div class="os-col">
              <div class="field">
                <label>Evento / cliente</label>
                <input [(ngModel)]="osForm.nome" placeholder="Ex: Festival de Verão" />
              </div>

              <div class="field">
                <label>Organizador / responsável</label>
                <input [(ngModel)]="osForm.organizador" placeholder="Nome do responsável pela OS" />
              </div>

              <div class="field-grid">
                <div class="field">
                  <label>Data início (montagem)</label>
                  <input type="date" [(ngModel)]="osForm.dataInicio" />
                </div>
                <div class="field">
                  <label>Data fim (desmontagem)</label>
                  <input type="date" [(ngModel)]="osForm.dataFim" />
                </div>
              </div>

              <div class="field">
                <label>
                  Localização <span class="hint-inline">selecione no mapa →</span>
                </label>
                <input
                  [(ngModel)]="osForm.local"
                  readonly
                  class="readonly mono"
                  placeholder="Clique no mapa para definir as coordenadas" />
              </div>
            </div>

            <div class="os-col">
              <div class="map-wrap">
                <div class="map-overlay-tag">
                  <span class="map-dot"></span>
                  Selecione o ponto de montagem
                </div>
                <app-map [viewOnly]="false" (locationSelected)="onMapClick($any($event))"></app-map>
              </div>
            </div>
          </div>
        </div>

        <!-- ======== SEÇÃO 2: ESTRUTURAS ======== -->
        <div class="os-section">
          <div class="os-section__head">
            <span class="os-section__num">02</span>
            <div>
              <h2>Estruturas e materiais</h2>
              <p>Componentes que serão deslocados para o evento.</p>
            </div>
          </div>

          <div class="add-row">
            <select [(ngModel)]="estruturaSelecionadaId" class="add-row__select">
              <option value="">— Escolha uma estrutura do banco —</option>
              <option *ngFor="let est of estruturasDoBanco()" [value]="est.id">{{ est.name }}</option>
            </select>
            <button class="btn-secondary" (click)="addEstrutura()" [disabled]="!estruturaSelecionadaId">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Adicionar
            </button>
          </div>

          <div class="structures">
            <div *ngFor="let est of estruturasAdicionadas(); let gIndex = index" class="structure">
              <header class="structure__head">
                <div class="structure__title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  <span>{{ est.name }}</span>
                  <span class="structure__count">
                    {{ (est.templates?.length || 0) }} {{ (est.templates?.length || 0) === 1 ? 'item' : 'itens' }}
                  </span>
                </div>
                <button class="btn-remove" (click)="removeEstrutura(gIndex)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Remover
                </button>
              </header>

              <table class="data-table inline-table">
                <thead>
                  <tr>
                    <th>ID material</th>
                    <th class="cell-right">Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="!est.templates || est.templates.length === 0">
                    <td colspan="2" class="empty-row">Estrutura sem itens vinculados no banco.</td>
                  </tr>
                  <tr *ngFor="let item of est.templates">
                    <td class="mono">{{ item.materialId }}</td>
                    <td class="cell-right mono">{{ item.quantity }} UN</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div *ngIf="estruturasAdicionadas().length === 0" class="empty-block">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <p>Nenhuma estrutura adicionada ainda.</p>
              <span>Use o seletor acima para incluir itens à OS.</span>
            </div>
          </div>
        </div>

        <footer class="os-doc__foot">
          <div class="foot-summary">
            <span class="foot-label">Total de estruturas</span>
            <span class="foot-value mono">{{ estruturasAdicionadas().length }}</span>
          </div>
          <button class="btn-primary btn-primary--large" [disabled]="isSaving()" (click)="finalizarOS()">
            <span>{{ isSaving() ? 'Salvando...' : 'Finalizar emissão e gerar evento' }}</span>
            <svg *ngIf="!isSaving()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </footer>
      </section>
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

    .meta-pill {
      display: inline-flex; flex-direction: column;
      padding: 5px 12px;
      background: var(--surface-sunken);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      line-height: 1.2;
    }
    .meta-pill__label {
      font-size: 9.5px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text-tertiary);
    }
    .meta-pill__value {
      font-size: 12.5px; font-weight: 600; color: var(--text-primary);
    }

    /* ============ DOC LAYOUT ============ */
    .os-page {
      padding: 24px 28px 36px;
      background: var(--bg-app);
      min-height: calc(100vh - 70px);
    }
    .os-doc {
      max-width: 1100px;
      margin: 0 auto;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .os-section {
      padding: 22px 28px;
      border-bottom: 1px solid var(--border);
    }
    .os-section__head {
      display: flex; align-items: flex-start; gap: 14px;
      margin-bottom: 18px;
    }
    .os-section__num {
      flex-shrink: 0;
      width: 28px; height: 28px;
      display: inline-flex; align-items: center; justify-content: center;
      background: var(--vivere-orange-soft);
      color: var(--vivere-orange);
      border: 1px solid var(--vivere-orange-border);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
    }
    .os-section__head h2 {
      margin: 0;
      font-size: 14.5px;
      font-weight: 600;
      color: var(--text-strong);
      letter-spacing: -0.1px;
    }
    .os-section__head p {
      margin: 2px 0 0;
      font-size: 12.5px;
      color: var(--text-tertiary);
    }

    /* ============ FORM GRID ============ */
    .os-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .os-col { display: flex; flex-direction: column; gap: 14px; }

    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label {
      font-size: 11.5px; font-weight: 600; letter-spacing: 0.5px;
      text-transform: uppercase; color: var(--text-secondary);
      display: flex; justify-content: space-between; align-items: baseline;
    }
    .hint-inline { font-weight: 400; font-size: 10.5px; color: var(--vivere-orange); text-transform: none; letter-spacing: 0; }
    .field input, .field select, .field textarea {
      padding: 9px 11px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      font-size: 13.5px;
      color: var(--text-primary);
      transition: border-color var(--duration) var(--ease), box-shadow var(--duration) var(--ease);
    }
    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none;
      border-color: var(--vivere-orange);
      box-shadow: 0 0 0 3px rgba(255,102,0,0.12);
    }
    .field input.readonly {
      background: var(--vivere-orange-soft);
      border-color: var(--vivere-orange-border);
      color: var(--vivere-orange);
      font-weight: 500;
    }
    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    /* ============ MAP ============ */
    .map-wrap {
      position: relative;
      height: 100%;
      min-height: 320px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .map-wrap ::ng-deep #main-map { height: 100% !important; min-height: 320px !important; }
    .map-overlay-tag {
      position: absolute;
      top: 10px; left: 10px;
      z-index: 400;
      display: inline-flex; align-items: center; gap: 7px;
      padding: 5px 10px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-size: 11.5px;
      font-weight: 500;
      color: var(--text-secondary);
      box-shadow: var(--shadow-sm);
    }
    .map-dot {
      width: 7px; height: 7px;
      background: var(--vivere-orange);
      border-radius: 50%;
      animation: pulse 1.6s var(--ease) infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255,102,0,0.5); }
      50%      { box-shadow: 0 0 0 6px rgba(255,102,0,0); }
    }

    /* ============ ADD ROW ============ */
    .add-row {
      display: flex; gap: 8px;
      margin-bottom: 14px;
    }
    .add-row__select {
      flex: 1;
      padding: 9px 11px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      font-size: 13.5px;
      color: var(--text-primary);
      cursor: pointer;
    }
    .add-row__select:focus {
      outline: none;
      border-color: var(--vivere-orange);
      box-shadow: 0 0 0 3px rgba(255,102,0,0.12);
    }

    .btn-secondary, .btn-primary {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 8px 13px; border-radius: var(--radius);
      font-size: 13px; font-weight: 500;
      cursor: pointer;
      transition: all var(--duration) var(--ease);
    }
    .btn-secondary svg, .btn-primary svg { width: 14px; height: 14px; }
    .btn-secondary {
      background: var(--surface); color: var(--text-primary);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover:not(:disabled) { border-color: var(--border-strong); background: var(--surface-hover); }
    .btn-secondary:disabled { color: var(--text-muted); cursor: not-allowed; }
    .btn-primary {
      background: var(--vivere-orange); color: white;
      border: 1px solid var(--vivere-orange);
    }
    .btn-primary:hover:not(:disabled) { background: var(--vivere-orange-hover); border-color: var(--vivere-orange-hover); }
    .btn-primary:disabled { background: var(--surface-sunken); color: var(--text-muted); border-color: var(--border); cursor: not-allowed; }

    /* ============ STRUCTURES ============ */
    .structures { display: flex; flex-direction: column; gap: 12px; }
    .structure {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      background: var(--surface);
    }
    .structure__head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px;
      background: var(--surface-sunken);
      border-bottom: 1px solid var(--border);
    }
    .structure__title {
      display: flex; align-items: center; gap: 10px;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .structure__title svg { width: 16px; height: 16px; color: var(--vivere-orange); }
    .structure__count {
      padding: 1px 7px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 10.5px;
      font-weight: 500;
      color: var(--text-tertiary);
      letter-spacing: 0.3px;
    }
    .btn-remove {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 9px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--duration) var(--ease);
    }
    .btn-remove svg { width: 12px; height: 12px; }
    .btn-remove:hover {
      color: var(--status-danger);
      border-color: var(--status-danger-border);
      background: var(--status-danger-bg);
    }

    .inline-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .inline-table th {
      padding: 8px 14px;
      text-align: left;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.7px;
      text-transform: uppercase;
      color: var(--text-tertiary);
      border-bottom: 1px solid var(--border-subtle);
    }
    .inline-table td {
      padding: 9px 14px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-primary);
    }
    .inline-table tr:last-child td { border-bottom: 0; }
    .cell-right { text-align: right; }
    .empty-row { color: var(--text-tertiary); font-style: italic; text-align: center; padding: 14px; }
    .mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 12.5px; }

    .empty-block {
      padding: 36px 20px;
      text-align: center;
      border: 1px dashed var(--border);
      border-radius: var(--radius);
      color: var(--text-tertiary);
      background: var(--surface-sunken);
    }
    .empty-block svg { width: 28px; height: 28px; color: var(--text-muted); margin-bottom: 8px; }
    .empty-block p { margin: 0 0 2px; font-size: 13px; font-weight: 500; color: var(--text-secondary); }
    .empty-block span { font-size: 12px; }

    /* ============ FOOTER ============ */
    .os-doc__foot {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 28px;
      background: var(--surface-sunken);
      border-top: 1px solid var(--border);
    }
    .foot-summary { display: flex; flex-direction: column; line-height: 1.2; }
    .foot-label { font-size: 10.5px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text-tertiary); }
    .foot-value { font-size: 18px; font-weight: 700; color: var(--text-strong); margin-top: 2px; }

    .btn-primary--large {
      padding: 11px 20px;
      font-size: 13.5px;
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .os-grid { grid-template-columns: 1fr; }
      .map-wrap { min-height: 260px; }
    }
  `]
})
export class OSListComponent implements OnInit {
  private eventService = inject(EventService);
  private materialService = inject(MaterialService);
  private osService = inject(ServiceOrderService);
  public router = inject(Router);

  today = new Date();
  isSaving = signal(false);

  osForm = { nome: '', organizador: '', dataInicio: '', dataFim: '', local: '', lat: 0, lng: 0, descricao: '' };

  estruturasDoBanco = signal<any[]>([]);
  estruturaSelecionadaId = '';
  estruturasAdicionadas = signal<any[]>([]);

  ngOnInit() {
    this.materialService.getStructures().subscribe({
      next: (data) => this.estruturasDoBanco.set(data),
      error: (err) => console.error("Erro ao carregar estruturas:", err)
    });
  }

  onMapClick(coords: { lat: number, lng: number }) {
    this.osForm.lat = coords.lat;
    this.osForm.lng = coords.lng;
    this.osForm.local = `LAT: ${coords.lat.toFixed(4)}, LNG: ${coords.lng.toFixed(4)}`;
  }

  addEstrutura() {
    if (!this.estruturaSelecionadaId) return;
    const estrutura = this.estruturasDoBanco().find(e => e.id === this.estruturaSelecionadaId);
    if (estrutura) {
      this.estruturasAdicionadas.update(prev => [...prev, estrutura]);
      this.estruturaSelecionadaId = '';
    }
  }

  removeEstrutura(index: number) {
    this.estruturasAdicionadas.update(prev => prev.filter((_, i) => i !== index));
  }

  finalizarOS() {
    if (!this.osForm.nome || !this.osForm.dataInicio || !this.osForm.lat) {
      alert("⚠️ Preencha nome, data de início e local no mapa.");
      return;
    }
    if (this.estruturasAdicionadas().length === 0) {
      alert("⚠️ Adicione pelo menos uma estrutura na Ordem de Serviço.");
      return;
    }

    this.isSaving.set(true);
    const start = new Date(this.osForm.dataInicio);
    const end = this.osForm.dataFim ? new Date(this.osForm.dataFim) : start;

    const eventPayload = {
      name: this.osForm.nome,
      latitude: this.osForm.lat,
      longitude: this.osForm.lng,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      status: 'PENDING',
      local: this.osForm.local,
      description: `Organizador: ${this.osForm.organizador}. Desc: ${this.osForm.descricao}`
    };

    this.eventService.createEvent(eventPayload).subscribe({
      next: (eventoCriado) => {
        const osPayload = {
          eventId: eventoCriado.id,
          structureIds: this.estruturasAdicionadas().map(e => e.id)
        };
        this.osService.createOS(osPayload).subscribe({
          next: () => {
            alert("✅ ORDEM DE SERVIÇO EMITIDA COM SUCESSO!");
            this.router.navigate(['/eventos']);
          },
          error: () => {
            alert("❌ Evento criado, mas falha ao criar OS. Verifique o backend.");
            this.isSaving.set(false);
          }
        });
      },
      error: (err) => {
        console.error("Erro no Evento:", err);
        alert("❌ Erro ao registrar o Evento.");
        this.isSaving.set(false);
      }
    });
  }
}