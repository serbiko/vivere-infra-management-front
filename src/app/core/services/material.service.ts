import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/materials'; 

  // Busca as estruturas (Ex: Tenda 10x10) e seus gabaritos
  getStructures(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.apiUrl}/structure`); 
  }

  getMaterials(): Observable<any[]> { 
    return this.http.get<any[]>(this.apiUrl); 
  }
}