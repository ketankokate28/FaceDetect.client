import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { PoliceStation } from '../models/police-station.model';

@Injectable({
  providedIn: 'root'
})
export class PoliceStationService {
  private configurations = inject(ConfigurationService);
  private baseUrl = `${this.configurations.baseUrl}`;

  constructor(private http: HttpClient) {}

  // Get all police stations
  getPoliceStations(): Observable<PoliceStation[]> {
    return this.http.get<PoliceStation[]>(`${this.baseUrl}/subnode/`);
  }

  // Get a specific police station by ID (optional)
  getPoliceStation(id: number): Observable<PoliceStation> {
    return this.http.get<PoliceStation>(`${this.baseUrl}/subnode/${id}`);
  }

  // Create a new police station
  createPoliceStation(data: PoliceStation): Observable<PoliceStation> {
    return this.http.post<PoliceStation>(`${this.baseUrl}/subnode/`, data);
  }

  // Update an existing police station
  updatePoliceStation(id: number, data: PoliceStation): Observable<any> {
    return this.http.put(`${this.baseUrl}/subnode/${id}`, data);
  }

  // Delete a police station
  deletePoliceStation(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/subnode/${id}`);
  }
}
