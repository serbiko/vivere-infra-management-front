import { Component, AfterViewInit, Input, Output, EventEmitter, inject } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  template: `<div id="main-map" style="height: 100%; min-height: 250px; border-radius: 8px;"></div>`,
})
export class MapComponent implements AfterViewInit {
  @Input() viewOnly: boolean = false;
  @Output() locationSelected = new EventEmitter<{lat: number, lng: number}>(); // EMISSOR DE COORDENADAS

  private map!: L.Map;

  ngAfterViewInit(): void {
    this.map = L.map('main-map').setView([-23.5505, -46.6333], 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    // SE NÃO FOR APENAS VISUALIZAÇÃO, PERMITE CLICAR
    if (!this.viewOnly) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        // Remove marcadores anteriores de seleção
        this.map.eachLayer((layer) => {
          if (layer instanceof L.Marker && !this.viewOnly) this.map.removeLayer(layer);
        });

        // Adiciona marcador no local clicado
        L.marker([lat, lng]).addTo(this.map);
        
        // Avisa o componente pai (OS) sobre as coordenadas
        this.locationSelected.emit({ lat, lng });
      });
    }
  }
}