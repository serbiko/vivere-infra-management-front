import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServiceOrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/service-orders';

  // Recebe o ID do evento e a lista de IDs das estruturas escolhidas
  createOS(orderData: { eventId: string, structureIds: string[] }): Observable<any> {
    return this.http.post(this.apiUrl, orderData);
  }
}