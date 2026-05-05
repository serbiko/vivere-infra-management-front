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
        <h1>{{ osAtual ? 'Gestão da Ordem de Serviço' : 'Nova ordem de serviço' }}</h1>
        <p class="subtitle">{{ osAtual ? 'Acompanhe o status e a liberação de estoque.' : 'Carga, montagem e logística do evento.' }}</p>
      </div>
      <div class="page-header__right" *ngIf="!osAtual">
        <div class="meta-pill">
          <span class="meta-pill__label">Emissão</span>
          <span class="meta-pill__value mono">{{ today | date:'dd/MM/yyyy' }}</span>
        </div>
      </div>
      <div class="page-header__right" *ngIf="osAtual">
        <button class="btn-secondary" (click)="voltarParaCriacao()">
          + Nova OS
        </button>
      </div>
    </header>

    <main class="os-page">
      
      <section class="os-doc" *ngIf="osAtual" style="padding: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div>
            <h2 style="margin: 0 0 5px; font-size: 22px;">OS: {{ osAtual.id }}</h2>
            <p style="margin: 0; color: #666;">Fornecedor/Org: {{ osAtual.supplier || 'Não informado' }}</p>
          </div>
          <span class="badge" 
                [ngClass]="{
                  'badge--neutral': osAtual.status === 'DRAFT',
                  'badge--info': osAtual.status === 'ACTIVE',
                  'badge--warn': osAtual.status === 'PENDING',
                  'badge--success': osAtual.status === 'READY'
                }" style="font-size: 14px; padding: 6px 12px;">
            STATUS: {{ osAtual.status }}
          </span>
        </div>

        <div style="background: var(--surface-sunken); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase;">Guia de Fluxo (State Machine)</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #555;">
            <li><strong>DRAFT:</strong> Criada pela Produção. Pode ser editada.</li>
            <li><strong>ACTIVE:</strong> Submetida ao Galpão. Produção aguarda.</li>
            <li><strong>PENDING:</strong> Devolvida pelo Galpão (com itens validados ou faltantes). Produção pode ajustar.</li>
            <li><strong>READY:</strong> Finalizada e aprovada pela Produção.</li>
          </ul>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
          <button class="btn-secondary" *ngIf="osAtual.status === 'DRAFT' || osAtual.status === 'PENDING'" (click)="isEditing = true; osAtual = null;">
            ✏️ Editar OS (PRODUÇÃO)
          </button>
          <button class="btn-primary" style="background: #17a2b8; border-color: #17a2b8;" *ngIf="osAtual.status === 'DRAFT' || osAtual.status === 'PENDING'" (click)="submeterOS()">
            📤 Enviar p/ Galpão [Gera ACTIVE] (PRODUÇÃO)
          </button>
          <button class="btn-primary" style="background: #ffc107; border-color: #ffc107; color: #000;" *ngIf="osAtual.status === 'ACTIVE'" (click)="submeterOS()">
            🛠️ Processar e Devolver [Gera PENDING] (GALPÃO)
          </button>
          <button class="btn-primary" style="background: var(--status-success); border-color: var(--status-success);" *ngIf="osAtual.status === 'PENDING'" (click)="finalizarAprovacao()">
            ✅ Finalizar e Aprovar OS [Gera READY] (PRODUÇÃO)
          </button>
        </div>
      </section>

      <section class="os-doc" *ngIf="!osAtual">
        <div class="os-section">
          <div class="os-section__head">
            <span class="os-section__num">01</span>
            <div>
              <h2>Dados do evento e Endereço</h2>
            </div>
          </div>

          <div class="os-grid">
            <div class="os-col">
              <div class="field">
                <label>Evento / projeto</label>
                <input [(ngModel)]="osForm.nome" [disabled]="isEditing" placeholder="Ex: Festival de Verão" />
              </div>
              <div class="field">
                <label>Organizador / Fornecedor</label>
                <input [(ngModel)]="osForm.organizador" placeholder="Nome do fornecedor" />
              </div>
              <div class="field-grid">
                <div class="field">
                  <label>Data início</label>
                  <input type="date" [(ngModel)]="osForm.dataInicio" [disabled]="isEditing" />
                </div>
                <div class="field">
                  <label>Data fim</label>
                  <input type="date" [(ngModel)]="osForm.dataFim" [disabled]="isEditing" />
                </div>
              </div>

              <h4 style="margin: 15px 0 5px; font-size: 12px; color: #666; text-transform: uppercase;">Endereço</h4>
              <div class="field-grid">
                <div class="field">
                  <label>Rua / Logradouro</label>
                  <input [(ngModel)]="osForm.street" [disabled]="isEditing" placeholder="Av. Principal, 1000" />
                </div>
                <div class="field">
                  <label>Cidade</label>
                  <input [(ngModel)]="osForm.city" [disabled]="isEditing" placeholder="Rio de Janeiro" />
                </div>
              </div>
              <div class="field-grid">
                <div class="field">
                  <label>Estado (UF)</label>
                  <input [(ngModel)]="osForm.state" [disabled]="isEditing" placeholder="RJ" maxlength="2" />
                </div>
                <div class="field">
                  <label>Coordenadas</label>
                  <input [(ngModel)]="osForm.local" readonly class="readonly mono" placeholder="Defina no mapa ->" />
                </div>
              </div>
            </div>

            <div class="os-col">
              <div class="map-wrap">
                <div class="map-overlay-tag"><span class="map-dot"></span>Selecione o ponto no mapa</div>
                <app-map [viewOnly]="isEditing" (locationSelected)="onMapClick($any($event))"></app-map>
              </div>
            </div>
          </div>
        </div>

        <div class="os-section">
          <div class="os-section__head">
            <span class="os-section__num">02</span>
            <div>
              <h2>Estruturas e materiais</h2>
              <p>Componentes que serão planificados e enviados na OS.</p>
            </div>
          </div>

          <div class="add-row">
            <select [(ngModel)]="estruturaSelecionadaId" class="add-row__select">
              <option value="">— Escolha uma estrutura do banco —</option>
              <option *ngFor="let est of estruturasDoBanco()" [value]="est.id">{{ est.name }}</option>
            </select>
            <button class="btn-secondary" (click)="addEstrutura()" [disabled]="!estruturaSelecionadaId">Adicionar</button>
          </div>

          <div class="structures">
            <div *ngFor="let est of estruturasAdicionadas(); let gIndex = index" class="structure">
              <header class="structure__head">
                <div class="structure__title"><span>{{ est.name }}</span></div>
                <button class="btn-remove" (click)="removeEstrutura(gIndex)">Remover</button>
              </header>
              <table class="data-table inline-table">
                <thead>
                  <tr>
                    <th style="text-align: left;">Nome do material</th>
                    <th class="cell-right">Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of est.templates">
                    <td class="locked-text" style="font-weight: 500;">📦 {{ getNomeMaterial(item.materialId) }}</td>
                    <td class="cell-right mono">{{ item.quantity }} UN</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <footer class="os-doc__foot">
          <div class="foot-summary">
            <span class="foot-label">Total de estruturas</span>
            <span class="foot-value mono">{{ estruturasAdicionadas().length }}</span>
          </div>
          <button class="btn-primary btn-primary--large" [disabled]="isSaving()" (click)="finalizarOS()">
            <span>{{ isSaving() ? 'Salvando...' : (isEditing ? 'Atualizar Rascunho da OS' : 'Salvar OS como Rascunho (DRAFT)') }}</span>
          </button>
        </footer>
      </section>
    </main>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 18px 28px; background: var(--surface); border-bottom: 1px solid var(--border); }
    .eyebrow { display: block; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 3px; }
    .page-header__title h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; color: var(--text-strong); margin: 0; }
    .page-header__title .subtitle { margin: 4px 0 0; font-size: 13px; color: var(--text-secondary); }
    .page-header__right { display: flex; gap: 8px; }
    .meta-pill { display: inline-flex; flex-direction: column; padding: 5px 12px; background: var(--surface-sunken); border: 1px solid var(--border); border-radius: var(--radius); line-height: 1.2; }
    .meta-pill__label { font-size: 9.5px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text-tertiary); }
    .meta-pill__value { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
    .os-page { padding: 24px 28px 36px; background: var(--bg-app); min-height: calc(100vh - 70px); }
    .os-doc { max-width: 1100px; margin: 0 auto; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
    .os-section { padding: 22px 28px; border-bottom: 1px solid var(--border); }
    .os-section__head { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px; }
    .os-section__num { flex-shrink: 0; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; background: var(--vivere-orange-soft); color: var(--vivere-orange); border: 1px solid var(--vivere-orange-border); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 12px; font-weight: 700; }
    .os-section__head h2 { margin: 0; font-size: 14.5px; font-weight: 600; color: var(--text-strong); letter-spacing: -0.1px; }
    .os-section__head p { margin: 2px 0 0; font-size: 12.5px; color: var(--text-tertiary); }
    .os-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .os-col { display: flex; flex-direction: column; gap: 14px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: baseline; }
    .field input, .field select, .field textarea { padding: 9px 11px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); font-size: 13.5px; color: var(--text-primary); transition: border-color var(--duration) var(--ease), box-shadow var(--duration) var(--ease); }
    .field input:focus, .field select:focus, .field textarea:focus { outline: none; border-color: var(--vivere-orange); box-shadow: 0 0 0 3px rgba(255,102,0,0.12); }
    .field input.readonly { background: var(--vivere-orange-soft); border-color: var(--vivere-orange-border); color: var(--vivere-orange); font-weight: 500; }
    .field input:disabled { background: var(--surface-sunken); color: var(--text-muted); cursor: not-allowed; }
    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .map-wrap { position: relative; height: 100%; min-height: 320px; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .map-wrap ::ng-deep #main-map { height: 100% !important; min-height: 320px !important; }
    .map-overlay-tag { position: absolute; top: 10px; left: 10px; z-index: 400; display: inline-flex; align-items: center; gap: 7px; padding: 5px 10px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); font-size: 11.5px; font-weight: 500; color: var(--text-secondary); box-shadow: var(--shadow-sm); }
    .map-dot { width: 7px; height: 7px; background: var(--vivere-orange); border-radius: 50%; animation: pulse 1.6s var(--ease) infinite; }
    @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,102,0,0.5); } 50% { box-shadow: 0 0 0 6px rgba(255,102,0,0); } }
    .add-row { display: flex; gap: 8px; margin-bottom: 14px; }
    .add-row__select { flex: 1; padding: 9px 11px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); font-size: 13.5px; color: var(--text-primary); cursor: pointer; }
    .btn-secondary, .btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 8px 13px; border-radius: var(--radius); font-size: 13px; font-weight: 500; cursor: pointer; transition: all var(--duration) var(--ease); }
    .btn-secondary { background: var(--surface); color: var(--text-primary); border: 1px solid var(--border); }
    .btn-secondary:hover:not(:disabled) { border-color: var(--border-strong); background: var(--surface-hover); }
    .btn-primary { background: var(--vivere-orange); color: white; border: 1px solid var(--vivere-orange); }
    .btn-primary:hover:not(:disabled) { background: var(--vivere-orange-hover); border-color: var(--vivere-orange-hover); }
    .structures { display: flex; flex-direction: column; gap: 12px; }
    .structure { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--surface); }
    .structure__head { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--surface-sunken); border-bottom: 1px solid var(--border); }
    .structure__title { font-size: 13.5px; font-weight: 600; color: var(--text-primary); }
    .btn-remove { padding: 4px 9px; background: transparent; border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 11.5px; font-weight: 500; cursor: pointer; }
    .btn-remove:hover { color: var(--status-danger); border-color: var(--status-danger-border); background: var(--status-danger-bg); }
    .inline-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .inline-table th { padding: 8px 14px; text-align: left; font-size: 10.5px; font-weight: 600; color: var(--text-tertiary); border-bottom: 1px solid var(--border-subtle); }
    .inline-table td { padding: 9px 14px; border-bottom: 1px solid var(--border-subtle); color: var(--text-primary); }
    .cell-right { text-align: right; }
    .mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-size: 12.5px; }
    .os-doc__foot { display: flex; align-items: center; justify-content: space-between; padding: 18px 28px; background: var(--surface-sunken); border-top: 1px solid var(--border); }
    .foot-summary { display: flex; flex-direction: column; line-height: 1.2; }
    .foot-label { font-size: 10.5px; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); }
    .foot-value { font-size: 18px; font-weight: 700; color: var(--text-strong); margin-top: 2px; }
    .badge { border-radius: var(--radius-sm); border: 1px solid; font-weight: 600; }
    .badge--info { color: var(--status-info); background: var(--status-info-bg); border-color: var(--status-info-border); }
    .badge--warn { color: var(--status-warning); background: var(--status-warning-bg); border-color: var(--status-warning-border); }
    .badge--danger { color: var(--status-danger); background: var(--status-danger-bg); border-color: var(--status-danger-border); }
    .badge--success { color: var(--status-success); background: var(--status-success-bg); border-color: var(--status-success-border); }
    .badge--neutral { color: var(--text-secondary); background: var(--surface-hover); border-color: var(--border-strong); }
  `]
})
export class OSListComponent implements OnInit {
  private eventService = inject(EventService);
  private materialService = inject(MaterialService);
  private osService = inject(ServiceOrderService);
  public router = inject(Router);

  today = new Date();
  isSaving = signal(false);
  isEditing = false;
  
  osAtual: any = null;
  eventoIdCriado: string = '';
  
  // MOCK: ID provisório para evitar o erro 500 do backend até criarem a rota de Galpão.
  galpaoIdProvisorio: string = '00000000-0000-0000-0000-000000000000'; 

  osForm = { 
    nome: '', organizador: '', dataInicio: '', dataFim: '', 
    local: '', lat: 0, lng: 0, descricao: '',
    street: '', city: '', state: '' 
  };

  estruturasDoBanco = signal<any[]>([]);
  materiaisDoBanco = signal<any[]>([]);
  estruturaSelecionadaId = '';
  estruturasAdicionadas = signal<any[]>([]);

  ngOnInit() {
    this.materialService.getStructures().subscribe(data => this.estruturasDoBanco.set(data));
    this.materialService.getMaterials().subscribe(data => this.materiaisDoBanco.set(data));
  }

  getNomeMaterial(id: string): string {
    const mat = this.materiaisDoBanco().find(m => m.id === id);
    return mat ? mat.name : 'Material Desconhecido';
  }

  onMapClick(coords: { lat: number, lng: number }) {
    if(this.isEditing && this.osAtual) return; 
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

  prepararPayloadItens() {
    const contadorMateriais: Record<string, number> = {};
    this.estruturasAdicionadas().forEach(est => {
      if (est.templates) {
        est.templates.forEach((template: any) => {
          const id = template.materialId;
          contadorMateriais[id] = (contadorMateriais[id] || 0) + template.quantity;
        });
      }
    });
    return Object.keys(contadorMateriais).map(materialId => ({
      materialId: materialId,
      operationalUnitId: this.galpaoIdProvisorio, 
      quantity: contadorMateriais[materialId]
    }));
  }

  finalizarOS() {
    if (!this.osForm.nome || !this.osForm.dataInicio || !this.osForm.lat) {
      alert("⚠️ Preencha nome, data de início e local no mapa."); return;
    }

    this.isSaving.set(true);

    if (this.isEditing && this.osAtual) {
      const osPayload = {
        eventId: this.eventoIdCriado,
        supplier: this.osForm.organizador,
        items: this.prepararPayloadItens()
      };

      this.osService.updateOS(this.osAtual.id, osPayload).subscribe({
        next: (osEditada) => {
          alert("✅ OS Atualizada com sucesso!");
          this.osAtual = osEditada;
          this.isEditing = false;
          this.isSaving.set(false);
        },
        error: () => { alert("❌ Erro ao atualizar OS. Verifique seu cargo."); this.isSaving.set(false); }
      });
    } else {
      let startStr = this.osForm.dataInicio;
      if (!startStr.includes('T')) startStr += 'T12:00:00';
      let endStr = this.osForm.dataFim ? this.osForm.dataFim : this.osForm.dataInicio;
      if (!endStr.includes('T')) endStr += 'T12:00:00';

      const eventPayload = {
        name: this.osForm.nome,
        latitude: this.osForm.lat, longitude: this.osForm.lng,
        street: this.osForm.street, city: this.osForm.city, state: this.osForm.state,
        startDate: new Date(startStr).toISOString(),
        endDate: new Date(endStr).toISOString(),
        status: 'PENDING'
      };

      this.eventService.createEvent(eventPayload).subscribe({
        next: (eventoCriado) => {
          this.eventoIdCriado = eventoCriado.id;
          const osPayload = {
            eventId: eventoCriado.id,
            supplier: this.osForm.organizador,
            items: this.prepararPayloadItens()
          };

          this.osService.createOS(osPayload).subscribe({
            next: (osCriada) => {
              alert("✅ Ordem de Serviço criada no status DRAFT.");
              this.osAtual = osCriada;
              this.isSaving.set(false);
            },
            error: () => { alert("❌ Falha ao criar OS. Verifique o console."); this.isSaving.set(false); }
          });
        },
        error: () => { alert("❌ Erro ao registrar o Evento."); this.isSaving.set(false); }
      });
    }
  }

  submeterOS() {
    this.osService.submitOS(this.osAtual.id).subscribe({
      next: (osAtualizada) => {
        this.osAtual = osAtualizada;
        alert(`✅ Status da OS mudou para: ${osAtualizada.status}`);
      },
      error: (err) => alert(err.error?.message || "Erro ao submeter (Verifique se seu Cargo possui permissão para mudar este status).")
    });
  }

  finalizarAprovacao() {
    this.osService.finalizeOS(this.osAtual.id).subscribe({
      next: (osAtualizada) => {
        this.osAtual = osAtualizada;
        alert("✅ OS Validada e Pronta (READY)!");
      },
      error: (err) => alert(err.error?.message || "Erro ao finalizar OS.")
    });
  }

  voltarParaCriacao() {
    this.osAtual = null;
    this.isEditing = false;
    this.osForm = { nome: '', organizador: '', dataInicio: '', dataFim: '', local: '', lat: 0, lng: 0, descricao: '', street: '', city: '', state: '' };
    this.estruturasAdicionadas.set([]);
  }
}