import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MapComponent } from '../../dashboard/components/map/map.component';
import { EventService } from '../../../core/services/event.service';

interface Material {
  descricao: string;
  unidade: string;
  qtd: number;
}

interface GrupoEstrutura {
  nome: string;
  itens: Material[];
}

@Component({
  selector: 'app-os-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  template: `
    <div class="os-page">
      <section class="os-form-container">
        <header class="os-doc-header">
          <div class="brand">VIVERE</div>
          <div class="doc-type">ORDEM DE SERVIÇO - CARGA E MONTAGEM</div>
          <div class="doc-info">EMISSÃO: {{ today | date:'dd/MM/yyyy' }}</div>
        </header>

        <div class="os-doc-body">
          <div class="section-top">
            <div class="basic-info">
              <div class="field">
                <label>EVENTO / CLIENTE</label>
                <input [(ngModel)]="osForm.nome" placeholder="Ex: Festival de Verão">
              </div>

              <div class="field">
                <label>ORGANIZADOR / RESPONSÁVEL</label>
                <input [(ngModel)]="osForm.organizador" placeholder="Nome do responsável pela OS">
              </div>

              <div class="field-row">
                <div class="field">
                  <label>DATA INÍCIO (MONTAGEM)</label>
                  <input type="date" [(ngModel)]="osForm.dataInicio">
                </div>
                <div class="field">
                  <label>DATA FIM (DESMONTAGEM)</label>
                  <input type="date" [(ngModel)]="osForm.dataFim">
                </div>
              </div>

              <div class="field">
                <label>LOCALIZAÇÃO (SELECIONE NO MAPA)</label>
                <input [(ngModel)]="osForm.local" readonly class="readonly-input">
              </div>
            </div>

            <div class="map-picker">
              <app-map [viewOnly]="false" (locationSelected)="onMapClick($any($event))"></app-map>
            </div>
          </div>

          <div class="section-selection">
            <label class="section-label">🏗️ INCLUIR ESTRUTURA COMPLETA (GABARITO FIXO)</label>
            <div style="display: flex; gap: 10px;">
              <select #estruturaSelect class="os-select" style="flex: 1;">
                <option value="">-- Escolha uma Estrutura --</option>
                <option value="TENDA_10">TENDA 10X10 PIRAMIDAL</option>
                <option value="PALCO_43">PALCO PRATICÁVEL 4X3M</option>
              </select>
              <button class="btn-add-group" (click)="addEstrutura(estruturaSelect.value); estruturaSelect.value=''">+ ADICIONAR ESTRUTURA</button>
            </div>
          </div>

          <div class="section-items">
            <label class="section-label">📦 DETALHAMENTO DA CARGA</label>
            
            <div *ngFor="let grupo of estruturas(); let gIndex = index" class="grupo-container">
              <div class="grupo-header">
                <span>🏗️ ESTRUTURA: {{ grupo.nome }}</span>
                <button (click)="removeGrupo(gIndex)" class="btn-remove-group">Remover Kit</button>
              </div>
              <table class="os-table fixed">
                <tr *ngFor="let item of grupo.itens">
                  <td class="locked-text">{{ item.descricao }}</td>
                  <td width="60" class="locked-text center">{{ item.unidade }}</td>
                  <td width="80" class="locked-text center">{{ item.qtd }}</td>
                </tr>
              </table>
            </div>

            <div class="grupo-container avulsos">
              <div class="grupo-header">
                <span>📦 MATERIAIS AVULSOS</span>
                <button (click)="addItemAvulso()" class="btn-add-small">+ NOVO ITEM</button>
              </div>
              <table class="os-table">
                <tr *ngFor="let item of avulsos(); let aIndex = index">
                  <td><input [(ngModel)]="item.descricao" placeholder="Descrição do material..." class="table-input"></td>
                  <td width="60" class="locked-cell center">{{ item.unidade }}</td>
                  <td width="80"><input type="number" [(ngModel)]="item.qtd" class="table-input center"></td>
                  <td width="30" class="center"><button (click)="removeAvulso(aIndex)" class="btn-del">×</button></td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <footer class="os-doc-footer">
          <button class="btn-save" (click)="finalizarOS()">FINALIZAR EMISSÃO E GERAR EVENTO</button>
        </footer>
      </section>
    </div>
  `,
  styles: [`
    .os-page { padding: 20px; background: #e9ecef; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
    .os-form-container { background: white; border: 2px solid #000; max-width: 1000px; margin: 0 auto; box-shadow: 10px 10px 0 rgba(0,0,0,0.1); }
    
    .os-doc-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding: 15px; background: #f8f9fa; }
    .brand { font-weight: 900; color: #ff6600; font-size: 1.5rem; }
    .doc-type { font-weight: 800; border: 1px solid #000; padding: 5px 15px; font-size: 0.8rem; }

    .os-doc-body { padding: 20px; }
    .section-top { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
    .map-picker { height: 260px; border: 1px solid #000; }
    
    .field { margin-bottom: 12px; }
    .field label { display: block; font-size: 0.65rem; font-weight: 900; margin-bottom: 4px; text-transform: uppercase; color: #555; }
    .field input { width: 100%; border: 1px solid #000; padding: 10px; box-sizing: border-box; font-size: 0.9rem; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .readonly-input { background: #fff5eb; color: #ff6600; font-weight: bold; border-style: dashed !important; }

    .section-label { display: block; font-size: 0.75rem; font-weight: 900; margin: 20px 0 10px 0; color: #000; }
    .os-select { padding: 10px; border: 2px solid #000; font-weight: bold; }
    .btn-add-group { background: #000; color: #fff; border: none; padding: 0 20px; cursor: pointer; font-weight: bold; }

    .grupo-container { border: 1px solid #000; margin-bottom: 15px; background: #fff; }
    .grupo-header { background: #000; color: #fff; padding: 8px 12px; font-size: 0.7rem; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
    
    .os-table { width: 100%; border-collapse: collapse; }
    .os-table td { border-bottom: 1px solid #eee; padding: 8px 12px; font-size: 0.85rem; }
    
    .locked-text { background: #f9f9f9; color: #888; font-style: italic; }
    .locked-cell { background: #eee; color: #999; font-weight: bold; font-size: 0.75rem; }
    
    .table-input { width: 100%; border: 1px solid #ddd; padding: 6px; font-size: 0.8rem; }
    .center { text-align: center; }

    .btn-remove-group { background: #ff4d4d; color: white; border: none; font-size: 0.6rem; padding: 4px 8px; cursor: pointer; }
    .btn-add-small { background: #27ae60; color: white; border: none; font-size: 0.6rem; padding: 4px 8px; cursor: pointer; }
    .btn-del { color: #ff4d4d; border: none; background: none; font-weight: bold; cursor: pointer; font-size: 1.1rem; }

    .os-doc-footer { padding: 20px; border-top: 2px solid #000; }
    .btn-save { width: 100%; padding: 20px; background: #ff6600; color: #000; border: none; font-weight: 900; font-size: 1.2rem; cursor: pointer; }
  `]
})
export class OSListComponent {
  private eventService = inject(EventService);
  private router = inject(Router);

  today = new Date();
  
  // Agora com organizador e datas de início/fim
  osForm = { 
    nome: '', 
    organizador: '',
    dataInicio: '', 
    dataFim: '',
    local: '', 
    lat: 0, 
    lng: 0,
    descricao: '' 
  };
  
  estruturas = signal<GrupoEstrutura[]>([]);
  avulsos = signal<Material[]>([]);

  onMapClick(coords: {lat: number, lng: number}) {
    this.osForm.lat = coords.lat;
    this.osForm.lng = coords.lng;
    this.osForm.local = `LAT: ${coords.lat.toFixed(4)} , LNG: ${coords.lng.toFixed(4)}`;
  }

  addEstrutura(tipo: string) {
    if (!tipo) return;
    
    let novoGrupo: GrupoEstrutura;
    if (tipo === 'TENDA_10') {
      novoGrupo = {
        nome: 'TENDA 10X10 PIRAMIDAL',
        itens: [
          { descricao: 'LONA COBERTURA 10X10', unidade: 'UN', qtd: 1 },
          { descricao: 'ESTRUTURA DE FERRO KIT', unidade: 'KIT', qtd: 1 },
          { descricao: 'ESTACAS DE FERRO', unidade: 'UN', qtd: 8 }
        ]
      };
    } else {
      novoGrupo = {
        nome: 'PALCO PRATICÁVEL 4X3M',
        itens: [
          { descricao: 'PRATICÁVEL 2X1M', unidade: 'UN', qtd: 6 },
          { descricao: 'ESCADA 2 DEGRAUS', unidade: 'UN', qtd: 1 }
        ]
      };
    }
    this.estruturas.update(prev => [...prev, novoGrupo]);
  }

  removeGrupo(index: number) {
    this.estruturas.update(prev => prev.filter((_, i) => i !== index));
  }

  addItemAvulso() {
    this.avulsos.update(prev => [...prev, { descricao: '', unidade: 'UN', qtd: 1 }]);
  }

  removeAvulso(index: number) {
    this.avulsos.update(prev => prev.filter((_, i) => i !== index));
  }

  finalizarOS() {
    if (!this.osForm.nome || !this.osForm.dataInicio || !this.osForm.lat) {
      alert("⚠️ DADOS INCOMPLETOS: Preencha o nome, a data de início e selecione o local no mapa.");
      return;
    }

    const start = new Date(this.osForm.dataInicio);
    const end = this.osForm.dataFim ? new Date(this.osForm.dataFim) : null;

    if (isNaN(start.getTime())) {
      alert("⚠️ Erro: Data de início inválida.");
      return;
    }

    const payload = {
      name: this.osForm.nome,
      date: start.toISOString(), // <--- Mantém feliz o event.service.ts (Frontend)
      latitude: this.osForm.lat,
      longitude: this.osForm.lng,
      startDate: start.toISOString(), // <--- Mantém feliz o Prisma/NestJS (Backend)
      endDate: end ? end.toISOString() : undefined,
      status: 'PENDING',
      description: `Organizador: ${this.osForm.organizador}. Desc: ${this.osForm.descricao}`
    };

    // Usamos o "as any" para o compilador do Angular parar de reclamar das propriedades extras
    this.eventService.createEvent(payload as any).subscribe({
      next: () => {
        alert("✅ ORDEM DE SERVIÇO EMITIDA COM SUCESSO!");
        this.router.navigate(['/eventos']);
      },
      error: (err) => {
        console.error("Erro no Backend:", err);
        alert("❌ Erro ao registrar no servidor. Verifique o console.");
      }
    });
  }
}