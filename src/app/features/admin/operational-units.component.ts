import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-operational-units',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header">
      <div class="page-header__title">
        <span class="eyebrow">Administração</span>
        <h1>Gestão de Unidades (Galpões)</h1>
        <p class="subtitle">Controle os galpões de estoque e pontos de distribuição.</p>
      </div>
      <div class="page-header__right">
        <button class="btn-primary" (click)="abrirModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          Nova Unidade
        </button>
      </div>
    </header>

    <main class="admin-main">
      <article class="card no-padding">
        <table class="data-table data-table--full">
          <thead>
            <tr>
              <th>Sigla</th>
              <th>Nome da Unidade</th>
              <th>Localização</th>
              <th>Status</th>
              <th class="cell-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let unit of units()">
              <td><span class="badge mono">[{{ unit.sigla }}]</span></td>
              <td>
                <div class="td-strong">{{ unit.name }}</div>
              </td>
              <td class="td-muted">{{ unit.city }} - {{ unit.state }}</td>
              <td><span class="status-dot completed" title="Ativo"></span> Ativo</td>
              <td class="cell-center">
                <button class="btn-icon" (click)="abrirModal(unit)" title="Editar">✏️</button>
                <button class="btn-icon" (click)="deletarUnidade(unit.id)" title="Remover">🗑️</button>
              </td>
            </tr>
            <tr *ngIf="units().length === 0">
              <td colspan="5" style="text-align: center; padding: 30px; color: #888;">Nenhuma unidade cadastrada.</td>
            </tr>
          </tbody>
        </table>
      </article>
    </main>

    <div *ngIf="showModal" class="modal-overlay" (click)="fecharModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal__head">
          <div>
            <span class="modal__eyebrow">Logística</span>
            <h3>{{ isEdit ? 'Editar Unidade' : 'Cadastrar Novo Galpão' }}</h3>
          </div>
          <button class="btn-close" (click)="fecharModal()">✕</button>
        </header>

        <div class="modal__body">
          <div class="field-grid">
            <div class="field" style="grid-column: span 2;">
              <label>Nome do Galpão</label>
              <input [(ngModel)]="formData.name" placeholder="Ex: Galpão Principal Norte" />
            </div>
            <div class="field">
              <label>Sigla de Identificação</label>
              <input [(ngModel)]="formData.sigla" placeholder="Ex: SP-01" maxlength="6" class="mono" />
            </div>
          </div>
          
          <h4 style="margin: 10px 0 0; font-size: 12px; color: var(--text-tertiary); text-transform: uppercase;">Localização Base</h4>
          <div class="field-grid">
            <div class="field">
              <label>Cidade</label>
              <input [(ngModel)]="formData.city" placeholder="Ex: São Paulo" />
            </div>
            <div class="field">
              <label>Estado (UF)</label>
              <select [(ngModel)]="formData.state">
                <option value="">UF</option>
                <option *ngFor="let uf of estados" [value]="uf">{{ uf }}</option>
              </select>
            </div>
          </div>
        </div>

        <footer class="modal__foot">
          <button class="btn-secondary" (click)="fecharModal()">Cancelar</button>
          <button class="btn-primary" (click)="salvarUnidade()">{{ isEdit ? 'Atualizar Galpão' : 'Criar Galpão' }}</button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 18px 28px; background: var(--surface); border-bottom: 1px solid var(--border); }
    .eyebrow { display: block; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 3px; }
    .page-header__title h1 { font-size: 18px; font-weight: 700; margin: 0; }
    .page-header__title .subtitle { margin: 4px 0 0; font-size: 13px; color: var(--text-secondary); }
    .btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 8px 13px; border-radius: var(--radius); font-size: 13px; font-weight: 500; cursor: pointer; background: var(--vivere-orange); color: white; border: 1px solid var(--vivere-orange); }
    .btn-primary svg { width: 16px; height: 16px; }
    .btn-secondary { padding: 8px 13px; border-radius: var(--radius); font-size: 13px; font-weight: 500; cursor: pointer; background: var(--surface); border: 1px solid var(--border); }
    .admin-main { padding: 20px 28px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
    .card.no-padding { padding: 0; overflow: hidden; }
    .data-table--full { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table--full th { padding: 10px 14px; background: var(--surface-sunken); text-align: left; font-size: 10.5px; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); border-bottom: 1px solid var(--border); }
    .data-table--full td { padding: 14px; border-bottom: 1px solid var(--border-subtle); vertical-align: middle; }
    .td-strong { font-weight: 600; color: var(--text-primary); }
    .td-muted { color: var(--text-tertiary); }
    .cell-center { text-align: center; }
    .badge { display: inline-block; padding: 3px 6px; font-size: 11px; font-weight: 700; border-radius: 4px; background: var(--surface-sunken); border: 1px solid var(--border); color: var(--text-secondary); }
    .mono { font-family: var(--font-mono); }
    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px;}
    .status-dot.completed { background: var(--status-success); box-shadow: 0 0 0 3px var(--status-success-bg); }
    .btn-icon { background: none; border: none; font-size: 16px; cursor: pointer; padding: 4px; border-radius: 4px; }
    .btn-icon:hover { background: var(--surface-hover); }
    
    /* MODAL */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 3000; }
    .modal { width: 500px; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-modal); display: flex; flex-direction: column; }
    .modal__head { padding: 18px 22px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; }
    .modal__eyebrow { font-size: 10.5px; font-weight: 600; color: var(--vivere-orange); display: block; margin-bottom: 4px; }
    .modal__head h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .btn-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--text-tertiary); }
    .modal__body { padding: 20px 22px; display: flex; flex-direction: column; gap: 15px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 11.5px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
    .field input, .field select { padding: 10px; border: 1px solid var(--border); border-radius: 4px; outline: none; }
    .field input:focus, .field select:focus { border-color: var(--vivere-orange); }
    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .modal__foot { padding: 15px 22px; background: var(--surface-sunken); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }
  `]
})
export class OperationalUnitsComponent implements OnInit {
  estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

  // MOCK DE DADOS (Banco de dados temporário na memória)
  units = signal<any[]>([
    { id: '1', name: 'Galpão Principal - SP', sigla: 'SP-01', city: 'São Paulo', state: 'SP' },
    { id: '2', name: 'Galpão Filial - RJ', sigla: 'RJ-01', city: 'Rio de Janeiro', state: 'RJ' }
  ]);

  showModal = false;
  isEdit = false;
  formData = { id: '', name: '', sigla: '', city: '', state: '' };

  ngOnInit() {}

  abrirModal(unit?: any) {
    if (unit) {
      this.isEdit = true;
      this.formData = { ...unit };
    } else {
      this.isEdit = false;
      this.formData = { id: '', name: '', sigla: '', city: '', state: '' };
    }
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
  }

  salvarUnidade() {
    if (!this.formData.name || !this.formData.sigla) {
      alert('Preencha pelo menos o Nome e a Sigla do Galpão!');
      return;
    }

    if (this.isEdit) {
      // Atualiza na memória
      this.units.update(lista => lista.map(u => u.id === this.formData.id ? { ...this.formData } : u));
    } else {
      // Cria na memória (Gera um ID fake)
      const novaUnidade = { ...this.formData, id: Math.random().toString(36).substr(2, 9) };
      this.units.update(lista => [...lista, novaUnidade]);
    }
    
    this.fecharModal();
  }

  deletarUnidade(id: string) {
    if (confirm('Tem certeza que deseja remover esta unidade?')) {
      this.units.update(lista => lista.filter(u => u.id !== id));
    }
  }
}