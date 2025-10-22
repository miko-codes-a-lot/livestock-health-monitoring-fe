import { Injectable } from '@angular/core';
import { LivestockBreed } from '../model/livestock-breed';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

// everything is to update
export class LivestockBreedService {
    constructor(private readonly http: HttpClient) {}
    // private readonly baseUrl = '/livestocks';
    private readonly baseUrl = `/livestock-breeds`;
    getEmptyOrNullDoc(): LivestockBreed {
      return {
        _id: '',
        name: '',
        classification: '',
      };
    }
  
    getAll(): Observable<LivestockBreed[]> {
      const test = this.http.get<LivestockBreed[]>(this.baseUrl, { withCredentials: true });
      return test
    }
  
    getOne(id: string): Observable<LivestockBreed> {
      return this.http.get<LivestockBreed>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
  
    create(livestockBreed: LivestockBreed): Observable<LivestockBreed> {
      return this.http.post<LivestockBreed>(this.baseUrl, livestockBreed, { withCredentials: true });
    }
  
    update(id: string, livestockBreed: LivestockBreed): Observable<LivestockBreed> {
      return this.http.put<LivestockBreed>(`${this.baseUrl}/${id}`, livestockBreed, { withCredentials: true });
    }
  
    delete(id: string): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }

}
