import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface atualizada com TUDO que o Frontend e o Backend precisam
export interface VivereEvent {
  id?: string;
  name: string;
  startDate: string;
  endDate?: string;
  latitude: number;
  longitude: number;
  local?: string;
  status: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  // Verifique se a porta do seu colega de backend é realmente a 3000
  private apiUrl = 'http://localhost:8080/events'; 

  getEvents(): Observable<VivereEvent[]> {
    return this.http.get<VivereEvent[]>(this.apiUrl);
  }

  createEvent(event: any): Observable<any> {
    return this.http.post(this.apiUrl, event);
  }

  // MÉTODO QUE O TYPESCRIPT ESTAVA SENTINDO FALTA
  updateEvent(id: string, event: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}