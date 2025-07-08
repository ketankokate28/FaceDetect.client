import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Site } from "../models/site.model";
import { ConfigurationService } from "./configuration.service";

@Injectable({ providedIn: 'root' })
export class SiteService {
  private configurations = inject(ConfigurationService);
  private readonly apiUrl = `${this.configurations.baseUrl}/sites`;
  constructor(private http: HttpClient) {}

  getSites(): Observable<Site[]> {
    return this.http.get<Site[]>(this.apiUrl);
  }

  createSite(site: Site): Observable<Site> {
    return this.http.post<Site>(this.apiUrl, site);
  }

  updateSite(id: number, site: Site): Observable<Site> {
    return this.http.put<Site>(`${this.apiUrl}/${id}`, site);
  }

  deleteSite(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
