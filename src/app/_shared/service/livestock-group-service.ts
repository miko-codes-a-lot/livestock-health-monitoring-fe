import { Injectable } from '@angular/core';
import { LivestockGroup } from '../model/livestock-group';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LivestockGroupService {
    constructor(private readonly http: HttpClient) {}
    // private readonly baseUrl = '/livestocks';
    private readonly baseUrl = `/livestock-groups`;
    getEmptyOrNullDoc(): LivestockGroup {
      const now = new Date();
      return {
        _id: '',                  // empty string for a new doc
        farmer: '',               // farmer id (string)
        groupName: '',            // empty group name
        groupPhotos: [],          // no photos yet
        status: 'pending',        // default status
        createdAt: now,           // current timestamp
        updatedAt: now,           // current timestamp
        statusAt: now,            // current timestamp
      };
    }
  
    getAll(): Observable<LivestockGroup[]> {
      console.log('dawdaw')
      const test = this.http.get<LivestockGroup[]>(this.baseUrl, { withCredentials: true });
      console.log('test', test)
      return test
    }
  
    getOne(id: string): Observable<LivestockGroup> {
      return this.http.get<LivestockGroup>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
  
    create(livestockGroup: LivestockGroup): Observable<LivestockGroup> {
      return this.http.post<LivestockGroup>(this.baseUrl, livestockGroup, { withCredentials: true });
    }
  
    update(id: string, livestockGroup: LivestockGroup): Observable<LivestockGroup> {
      return this.http.put<LivestockGroup>(`${this.baseUrl}/${id}`, livestockGroup, { withCredentials: true });
    }
  
    delete(id: string): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
}
