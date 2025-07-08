import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';
import { ConfigurationService } from './configuration.service';
import { Cctv } from '../models/cctv.model';

@Injectable({
  providedIn: 'root'
})
export class CctvViewService {
  private configurations = inject(ConfigurationService);
  private baseUrl =  `${this.configurations.baseUrl}`;  // API endpoint to add CCTV

  constructor(private http: HttpClient) { }

  // Get all CCTVs
  //getCctvs(siteId: number | undefined): Observable<Cctv[]> {
    //return this.http.get<Cctv[]>(`${this.baseUrl}/cctv/`);
  //}

getCctvs(siteId?: number): Observable<Cctv[]> {
  const params: { [param: string]: string } = {};
  if (siteId !== undefined) {
    params['siteId'] = siteId.toString();
  }

  return this.http.get<Cctv[]>(`${this.baseUrl}/cctv/`, {
    params
  });
}


  // Get a specific CCTV by ID (optional use)
  getCctv(id: number): Observable<Cctv> {
    return this.http.get<Cctv>(`${this.baseUrl}/cctv/${id}`);
  }

  // Create a new CCTV
  createCctv(cctv: Cctv, siteId: number): Observable<Cctv> {
     cctv.siteId = siteId;
    return this.http.post<Cctv>(`${this.baseUrl}/cctv/`, cctv);
  }

  // Update existing CCTV
  updateCctv(id: number, cctv: Cctv): Observable<any> {
    return this.http.put(`${this.baseUrl}/cctv/${id}`, cctv);
  }

  // Delete a CCTV
  deleteCctv(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cctv/${id}`);
  }
}
