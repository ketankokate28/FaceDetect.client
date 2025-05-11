import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationAlert } from '../models/NotificationAlert.model';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationAlertService {
  private configurations = inject(ConfigurationService);
  //private baseUrl = 'http://localhost:5000/api/notification'; // Adjust as needed
  private apiUrl = `${this.configurations.baseUrl}/notification`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<NotificationAlert[]> {
    return this.http.get<NotificationAlert[]>(`${this.apiUrl}/`);
  }

  getById(id: number): Observable<NotificationAlert> {
    return this.http.get<NotificationAlert>(`${this.apiUrl}/?id=${id}`);
  }
}
