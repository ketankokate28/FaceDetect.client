import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tenant } from '../models/hierarchy.model';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class HierarchyService {
  private configurations = inject(ConfigurationService);
  private cacheData: Tenant[] | null = null;
  private cacheTime: number | null = null;
  private readonly cacheTTL = 60 * 60 * 1000; // cache time in ms (5 minutes)
  private readonly baseUrl = `${this.configurations.baseUrl}/auth`;
  constructor(private http: HttpClient) {}

  getHierarchy(forceRefresh = false): Observable<Tenant[]> {
  const now = Date.now();

  if (!forceRefresh && this.cacheData && this.cacheTime && (now - this.cacheTime < this.cacheTTL)) {
    // cached & still valid
    return of(this.cacheData);
  }

  // fetch from backend
  return this.http.get<Tenant[]>(`${this.baseUrl}/hierarchy`).pipe(
    tap(data => {
      this.cacheData = data;
      this.cacheTime = Date.now();
    })
  );
}


  clearCache() {
    this.cacheData = null;
    this.cacheTime = null;
  }
}
