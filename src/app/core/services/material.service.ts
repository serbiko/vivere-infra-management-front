import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/materials'; 

  // --- MATERIAIS BASE ---
  getMaterials(): Observable<any[]> { 
    return this.http.get<any[]>(this.apiUrl); 
  }
  createMaterial(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  deleteMaterial(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // --- ESTRUTURAS (GABARITOS) ---
  getStructures(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.apiUrl}/structure`); 
  }
  createStructure(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/structure`, data);
  }
  deleteStructure(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/structure/${id}`);
  }
}