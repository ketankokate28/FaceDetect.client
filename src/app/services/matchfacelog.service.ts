import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigurationService } from './configuration.service';

export interface MatchFaceLogSummary {
  suspectId: number;
  latestCapture: string;
  matchCount: number;
  suspectName: string;
}
export interface IncidentLog {
  id: number;
  captureTime: string;
  frame: string;
  suspectId: number;
  suspect: string;
  distance: number;
  cctvName?: string;
  cctvLocation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatchFaceLogService {
  private configurations = inject(ConfigurationService);
  private readonly baseUrl = `${this.configurations.baseUrl}/matchfacelogs`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<MatchFaceLogSummary[]> {
    return this.http.get<MatchFaceLogSummary[]>(`${this.baseUrl}/summary`);
  }

getIncidentsBySuspect(suspectId: number): Observable<{ logs: any[], suspectPhoto: string }> {
  return this.http.get<{ logs: any[], suspectPhoto: string }>(`${this.baseUrl}/suspect/${suspectId}`);
}

getLogById(logId: number) {
  return this.http.get<any>(`${this.baseUrl}/log/${logId}`);
}

}
