import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OsItemPayload {
  materialId: string;
  operationalUnitId: string; // NOVO: Exigência do backend
  quantity: number;
}

export interface CreateOsPayload {
  eventId: string;
  supplier?: string;
  items: OsItemPayload[];
}

@Injectable({ providedIn: 'root' })
export class ServiceOrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/service-orders';

  // 1. Cria OS (Nasce como DRAFT)
  createOS(orderData: CreateOsPayload): Observable<any> {
    return this.http.post(this.apiUrl, orderData);
  }

  // 2. Atualiza OS (DRAFT ou PENDING)
  updateOS(orderId: string, orderData: CreateOsPayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}`, orderData);
  }

  // 3. Submeter OS (Produção -> Galpão [ACTIVE] | Galpão -> Produção [PENDING])
  submitOS(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${orderId}/submit`, {});
  }

  // 4. Finalizar OS (Produção finaliza a OS validada -> READY)
  finalizeOS(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${orderId}/ready`, {});
  }
}