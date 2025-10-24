import { Injectable } from '@angular/core';
import { InsurancePolicy } from '../model/insurance-policy';
import { Observable, map, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InsurancePolicyService {
    constructor(private readonly http: HttpClient) {}
    // private readonly baseUrl = '/livestocks';
    private readonly baseUrl = `/insurance-policies`;
    getEmptyOrNullDoc(): InsurancePolicy {
      const now = new Date().toISOString(); 
      return {
        _id: '',   
        farmer: '',
        livestockGroup: '',  
        policyNumber: '',   
        provider: '',                
        startDate: now,                  
        endDate: now,                    
        policyDocument: '',          
        status: 'pending',              
      };
    }

    // uploadGroupPhotos

    uploadPolicyDocument(insurancePolicyId: any, file: File): Observable<any> {
      const formData = new FormData();
      formData.append('document', file); // single file
      return this.http.put(
        `${this.baseUrl}/${insurancePolicyId}/document`,
        formData,
        { withCredentials: true }
      );
    }

    getPolicyDocument(filename: string): Observable<string> {
      const url = `${this.baseUrl}/${filename}/document`;
      return this.http.get(url, { responseType: 'blob', withCredentials: true }).pipe(
        map(blob => URL.createObjectURL(blob))
      );
    }
  
    getAll(): Observable<InsurancePolicy[]> {
      const test = this.http.get<InsurancePolicy[]>(this.baseUrl, { withCredentials: true });
      console.log('test', test)
      return test
    }
  
    getOne(id: string): Observable<InsurancePolicy> {
      return this.http.get<InsurancePolicy>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
  
    create(insurancePolicy: InsurancePolicy): Observable<InsurancePolicy> {
      return this.http.post<InsurancePolicy>(this.baseUrl, insurancePolicy, { withCredentials: true });
    }
  
    update(id: string, insurancePolicy: InsurancePolicy): Observable<InsurancePolicy> {
      return this.http.put<InsurancePolicy>(`${this.baseUrl}/${id}`, insurancePolicy, { withCredentials: true });
    }
  
    delete(id: string): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
}
