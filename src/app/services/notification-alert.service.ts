import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationAlert } from '../models/NotificationAlert.model';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationAlertService {
  private configurations = inject(ConfigurationService);
  private baseUrl =`${this.configurations.baseUrl}/notification`;

  constructor(private http: HttpClient) { }

  // Get summary list for dashboard
  getNotificationSummary(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/summary`);
  }

  // Get detailed delivery information for a notification and recipient
  getNotificationDetails(notificationId: number, recipientId: number): Observable<any[]> {
    const params = new HttpParams()
      .set('notification_id', notificationId.toString())
      .set('recipient_id', recipientId.toString());

    return this.http.get<any[]>(`${this.baseUrl}/details`, { params });
  }
}
