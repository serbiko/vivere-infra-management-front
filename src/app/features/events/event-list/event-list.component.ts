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
    <div class="events-container">
      <header class="events-header">
        <div>
          <h2 style="margin: 0; color: #1a1a1a; font-weight: 900; letter-spacing: -0.5px;">📅 GESTÃO DE EVENTOS</h2>
          <p style="color: #666; margin: 5px 0 0 0; font-size: 0.9rem;">Controle de montagens sincronizado com o Banco de Dados.</p>
        </div>
        <button class="btn-primary" (click)="router.navigate(['/ordens'])">+ NOVO PLANEJAMENTO (OS)</button>
      </header>

      <div class="filter-bar">
        <button [class.active]="filter === 'ALL'" (click)="filter = 'ALL'">Todos</button>
        <button [class.active]="filter === 'PENDING'" (click)="filter = 'PENDING'">📝 Planejamento</button>
        <button [class.active]="filter === 'IN_PROGRESS'" (click)="filter = 'IN_PROGRESS'">🏗️ Em Montagem</button>
        <button [class.active]="filter === 'COMPLETED'" (click)="filter = 'COMPLETED'">✅ Finalizados</button>
      </div>

      <div class="events-grid">
        <div *ngFor="let event of filteredEvents()" class="event-card" [ngClass]="event.status.toLowerCase()">
          <div class="card-status-bar"></div>
          <div class="card-content">
            <div class="card-header">
              <span class="event-date">{{ event.startDate | date:'dd/MM/yyyy' }}</span>
              <span class="event-badge" [ngClass]="event.status.toLowerCase()">{{ event.status }}</span>
            </div>
            <h3 class="event-name">{{ event.name }}</h3>
            <p class="event-desc">{{ event.description || 'Sem descrição detalhada.' }}</p>
            
            <div class="event-info">
              <span>📍 {{ event.local || 'Local não definido' }}</span>
            </div>

            <div class="card-footer">
              <button class="btn-outline" (click)="abrirEdicao(event)">Visualizar / Editar</button>
              <button class="btn-icon" (click)="abrirEdicao(event)">⚙️</button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="filteredEvents().length === 0" class="empty-state">
        <div style="font-size: 3rem; margin-bottom: 10px;">🔍</div>
        <p>Nenhum evento encontrado nesta categoria.</p>
      </div>

      <div *ngIf="editForm" class="modal-overlay">
        <div class="details-modal">
          <header class="modal-header">
            <h3>📝 EDITAR DADOS DO EVENTO</h3>
            <button (click)="editForm = null" class="btn-close">&times;</button>
          </header>
          
          <div class="modal-body">
            <div class="info-group">
              <label>NOME DO EVENTO / PROJETO</label>
              <input [(ngModel)]="editForm.name" class="edit-input">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div class="info-group">
                <label>STATUS LOGÍSTICO</label>
                <select [(ngModel)]="editForm.status" class="edit-input">
                  <option value="PENDING">PLANEJAMENTO</option>
                  <option value="IN_PROGRESS">EM MONTAGEM</option>
                  <option value="COMPLETED">FINALIZADO</option>
                </select>
              </div>
              <div class="info-group">
                <label>DATA INÍCIO</label>
                <input type="date" [ngModel]="editForm.startDate | date:'yyyy-MM-dd'" (ngModelChange)="editForm.startDate=$event" class="edit-input">
              </div>
            </div>

            <div class="info-group">
              <label>OBSERVAÇÕES DA OS / CARGA</label>
              <textarea [(ngModel)]="editForm.description" rows="4" class="edit-input"></textarea>
            </div>
          </div>

          <footer class="modal-footer">
            <button class="btn-save" (click)="salvarAlteracoes()">SALVAR NO BANCO DE DADOS</button>
            <button class="btn-cancel" (click)="editForm = null">CANCELAR</button>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .events-container { padding: 30px; background: #f4f4f4; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
    .events-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    
    .filter-bar { display: flex; gap: 10px; margin-bottom: 25px; }
    .filter-bar button { padding: 10px 20px; border-radius: 8px; border: 1px solid #ddd; background: white; cursor: pointer; font-size: 0.85rem; font-weight: 600; color: #666; transition: 0.3s; }
    .filter-bar button.active { background: #1a1a1a; color: white; border-color: #1a1a1a; }

    .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
    
    .event-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); position: relative; transition: transform 0.2s, box-shadow 0.2s; }
    .event-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    
    .card-status-bar { height: 6px; width: 100%; background: #ccc; }
    .event-card.pending .card-status-bar { background: #ff6600; }
    .event-card.in_progress .card-status-bar { background: #3498db; }
    .event-card.completed .card-status-bar { background: #2e7d32; }

    .card-content { padding: 20px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .event-date { font-size: 0.75rem; color: #bbb; font-weight: bold; text-transform: uppercase; }
    
    .event-badge { font-size: 0.6rem; padding: 4px 10px; border-radius: 20px; font-weight: 800; background: #eee; text-transform: uppercase; }
    .event-badge.pending { background: #fff5eb; color: #ff6600; }
    .event-badge.in_progress { background: #e3f2fd; color: #1976d2; }
    .event-badge.completed { background: #e8f5e9; color: #2e7d32; }

    .event-name { margin: 0; color: #1a1a1a; font-size: 1.2rem; font-weight: 900; }
    .event-desc { font-size: 0.85rem; color: #777; margin: 12px 0; min-height: 40px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .event-info { font-size: 0.8rem; color: #555; margin-bottom: 20px; font-weight: 600; }

    .card-footer { display: flex; gap: 10px; border-top: 1px solid #f5f5f5; padding-top: 15px; }
    .btn-outline { flex: 1; padding: 10px; border: 1px solid #eee; background: white; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 700; color: #555; transition: 0.2s;}
    .btn-outline:hover { border-color: #ff6600; color: #ff6600; background: #fffaf5; }
    .btn-icon { padding: 10px; border: 1px solid #eee; background: #fafafa; border-radius: 8px; cursor: pointer; transition: 0.2s; }
    .btn-icon:hover { background: #eee; }

    .btn-primary { background: #ff6600; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 0.85rem; box-shadow: 0 4px 10px rgba(255, 102, 0, 0.2); }
    .empty-state { text-align: center; padding: 100px 20px; color: #bbb; grid-column: 1 / -1; }

    /* ESTILOS DO MODAL DE EDIÇÃO */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 3000; }
    .details-modal { background: white; width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    .modal-header { background: #1a1a1a; color: white; padding: 20px 25px; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #ff6600; }
    .btn-close { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
    
    .modal-body { padding: 30px 25px; }
    .info-group { margin-bottom: 20px; }
    .info-group label { display: block; font-size: 0.7rem; font-weight: 900; color: #666; margin-bottom: 8px; text-transform: uppercase; }
    .edit-input { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.95rem; box-sizing: border-box; font-family: inherit; }
    .edit-input:focus { border-color: #ff6600; outline: none; }
    
    .modal-footer { padding: 20px 25px; border-top: 1px solid #eee; background: #fafafa; display: flex; gap: 15px; }
    .btn-save { flex: 2; background: #ff6600; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 900; font-size: 0.9rem; cursor: pointer; transition: 0.2s;}
    .btn-save:hover { background: #e65c00; }
    .btn-cancel { flex: 1; background: #ddd; color: #333; border: none; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; }
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

  abrirEdicao(event: VivereEvent) {
    this.editForm = { ...event };
  }

  salvarAlteracoes() {
    if (this.editForm && this.editForm.id) {
      
      // Converte a data do input (YYYY-MM-DD) para ISO se ela tiver sido alterada
      if (this.editForm.startDate && !this.editForm.startDate.includes('T')) {
        this.editForm.startDate = new Date(this.editForm.startDate).toISOString();
      }

      this.eventService.updateEvent(this.editForm.id, this.editForm).subscribe({
        next: () => {
          alert("✅ Banco de Dados atualizado com sucesso!");
          this.editForm = null;
          this.loadEvents(); 
        },
        error: (err: any) => alert("❌ Erro ao salvar: " + err.message)
      });
    }
  }
}