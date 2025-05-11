import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class CctvService {
  private configurations = inject(ConfigurationService);
  private apiUrl =  `${this.configurations.baseUrl}`;  // API endpoint to add CCTV

  constructor(private http: HttpClient) { }

  // Method to add CCTV
  addCctv(cctvData: { name: string, streamUrl: string }): Observable<any> {
    return this.http.post(this.apiUrl +'/cctv/', cctvData);
  }
   // Method to fetch CCTV list from the API
   getCctvs(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl+'/cctv/');
  }

  updateCctv(id: number, name: string, streamUrl: string): Observable<Todo> {
    const updatedCctv = { name, streamUrl };
    return this.http.put<Todo>(`${this.apiUrl}/cctv/${id}`, updatedCctv);
  }

  deleteCctv(id: number): Observable<Todo> {
    return this.http.delete<Todo>(`${this.apiUrl}/cctv/${id}`);
  }
}
