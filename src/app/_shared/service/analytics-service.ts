import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private readonly http: HttpClient) {}

  private readonly baseUrl = `/analytics`;

  getData(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }
}
