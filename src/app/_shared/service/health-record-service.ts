import { Injectable } from '@angular/core';
import { HealthRecord } from '../model/health-record';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HealthRecordService {
    constructor(private readonly http: HttpClient) {}
    // private readonly baseUrl = '/livestocks';
    private readonly baseUrl = `/health-records`;
    getEmptyOrNullDoc(): HealthRecord {
      return {
        _id: '',
        animal: '',
        bodyCondition: '',
        createdAt: new Date().toISOString(),
        dewormingDate: undefined,
        diagnosis: '',
        notes: '',
        symptomsObserved: '',
        technician: '',
        treatmentGiven: '',
        updatedAt: new Date().toISOString(),
        vaccinationDate: undefined,
        visitDate: new Date().toISOString(),
        vitaminsAdministered: '',
        weightKg: 0,
      };
    }
    getAll(): Observable<HealthRecord[]> {
      const test = this.http.get<HealthRecord[]>(this.baseUrl, { withCredentials: true });
      return test
    }
  
    getOne(id: string): Observable<HealthRecord> {
      return this.http.get<HealthRecord>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
  
    create(healthRecord: HealthRecord): Observable<HealthRecord> {
      return this.http.post<HealthRecord>(this.baseUrl, healthRecord, { withCredentials: true });
    }
  
    update(id: string, healthRecord: HealthRecord): Observable<HealthRecord> {
      return this.http.put<HealthRecord>(`${this.baseUrl}/${id}`, healthRecord, { withCredentials: true });
    }
  
    delete(id: string): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
}
