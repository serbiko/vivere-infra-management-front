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
    <div class="stock-container">
      <header class="stock-header">
        <h2 style="color: var(--vivere-black); margin: 0;">📦 Gestão de Estoque e Estruturas</h2>
        <div class="tab-menu">
          <button [class.active]="tab === 'inventario'" (click)="tab = 'inventario'">Inventário Global</button>
          <button [class.active]="tab === 'gabarito'" (click)="tab = 'gabarito'">Gabaritos de Estruturas</button>
        </div>
      </header>

      <div *ngIf="tab === 'inventario'" class="tab-content">
        <div class="stats-row">
          <div class="stat-card">
            <span class="label">Itens Ativos em Campo</span>
            <strong class="value">452</strong>
          </div>
          <div class="stat-card alert">
            <span class="label">Alertas de Reposição</span>
            <strong class="value">3</strong>
          </div>
        </div>

        <div class="table-container">
          <table class="vivere-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Unidade</th>
                <th>Total</th>
                <th>Em Uso</th>
                <th>Disponível</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of inventario()">
                <td><strong>{{ item.nome }}</strong></td>
                <td>{{ item.unidade }}</td>
                <td>{{ item.total }}</td>
                <td>{{ item.emUso }}</td>
                <td [style.color]="item.disponivel < 10 ? 'red' : 'inherit'" style="font-weight: bold;">
                  {{ item.disponivel }}
                </td>
                <td>
                  <span class="status-pill" [class.low]="item.disponivel < 10">
                    {{ item.disponivel < 10 ? 'Estoque Baixo' : 'Estável' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="tab === 'gabarito'" class="tab-content">
        <div class="gabarito-grid">
          <div class="estrutura-sidebar">
            <div style="padding: 10px; font-size: 0.7rem; color: #999; font-weight: bold;">SELECIONE O GABARITO</div>
            <button *ngFor="let est of gabaritos()" 
                    (click)="selecionarEstrutura(est)"
                    [class.selected]="estSelecionada?.id === est.id">
              🏗️ {{ est.nome }}
            </button>
            <button class="btn-add-est">+ Nova Estrutura</button>
          </div>

          <div class="estrutura-detalhes" *ngIf="estSelecionada">
            <h3>Composição: {{ estSelecionada.nome }}</h3>
            <p class="hint">Abaixo estão os materiais que compõem 1 unidade desta estrutura. Estes dados alimentam a Ordem de Serviço automaticamente.</p>
            
            <table class="vivere-table mini">
              <thead>
                <tr>
                  <th>Material Necessário</th>
                  <th>Quantidade</th>
                  <th>Unidade</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let mat of estSelecionada.materiais">
                  <td>{{ mat.nome }}</td>
                  <td><strong>{{ mat.qtdNecessaria }}</strong></td>
                  <td>{{ mat.unidade }}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="margin-top: 25px; display: flex; gap: 10px;">
              <button class="btn-primary">Editar Composição</button>
              <button class="btn-secondary">Duplicar Gabarito</button>
            </div>
          </div>

          <div class="estrutura-detalhes empty" *ngIf="!estSelecionada">
            <div style="text-align: center; color: #bbb; padding-top: 100px;">
              <span style="font-size: 3rem;">🏗️</span>
              <p>Selecione uma estrutura ao lado para ver sua composição de materiais.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stock-container { padding: 30px; background: #f4f4f4; min-height: calc(100vh - 70px); font-family: 'Segoe UI', sans-serif; }
    .stock-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    
    .tab-menu { display: flex; gap: 5px; background: #e0e0e0; padding: 5px; border-radius: 8px; }
    .tab-menu button { padding: 10px 20px; border: none; background: transparent; cursor: pointer; border-radius: 6px; font-weight: bold; color: #666; transition: 0.2s; }
    .tab-menu button.active { background: white; color: var(--vivere-black); shadow: 0 2px 4px rgba(0,0,0,0.1); }

    .stats-row { display: flex; gap: 20px; margin-bottom: 25px; }
    .stat-card { background: white; padding: 20px; border-radius: 12px; flex: 1; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-bottom: 4px solid #ddd; }
    .stat-card.alert { border-bottom-color: var(--vivere-orange); }
    .stat-card .label { color: #888; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
    .stat-card .value { display: block; font-size: 2rem; margin-top: 10px; color: var(--vivere-black); }

    .table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .vivere-table { width: 100%; border-collapse: collapse; }
    .vivere-table th { background: #fafafa; padding: 15px; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; }
    .vivere-table td { padding: 15px; border-bottom: 1px solid #f9f9f9; font-size: 0.9rem; }

    .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; background: #e8f5e9; color: #2ecc71; }
    .status-pill.low { background: #ffebee; color: #e74c3c; }

    .gabarito-grid { display: grid; grid-template-columns: 280px 1fr; gap: 25px; min-height: 500px; }
    .estrutura-sidebar { background: white; border-radius: 12px; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .estrutura-sidebar button { width: 100%; text-align: left; padding: 15px; margin-bottom: 8px; border: 1px solid #f0f0f0; background: #fff; cursor: pointer; border-radius: 8px; transition: 0.2s; font-weight: 500; color: #444; }
    .estrutura-sidebar button:hover { border-color: var(--vivere-orange); background: #fffaf5; }
    .estrutura-sidebar button.selected { border-color: var(--vivere-orange); background: var(--vivere-orange); color: white; }
    
    .btn-add-est { border: 2px dashed #ddd !important; color: #999 !important; text-align: center !important; margin-top: 10px; }
    .btn-add-est:hover { border-color: var(--vivere-orange) !important; color: var(--vivere-orange) !important; }

    .estrutura-detalhes { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .hint { font-size: 0.85rem; color: #888; margin-bottom: 25px; line-height: 1.5; }
    
    .btn-primary { background: var(--vivere-black); color: white; border: none; padding: 12px 25px; border-radius: 6px; cursor: pointer; font-weight: bold; }
    .btn-secondary { background: #eee; color: #444; border: none; padding: 12px 25px; border-radius: 6px; cursor: pointer; font-weight: bold; }
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