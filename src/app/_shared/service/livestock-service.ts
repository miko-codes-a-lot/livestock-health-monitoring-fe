import { Injectable } from '@angular/core';
import { Livestock } from '../model/livestock';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class LivestockService {
    constructor(private readonly http: HttpClient) {}
    // private readonly baseUrl = '/livestocks';
    private readonly baseUrl = `/livestocks`;
    getEmptyOrNullDoc(): Livestock {
        return {
            tagNumber: '',
            species: '',
            breed: '',
            sex: 'male',
            age: 0,
            dateOfPurchase: '',
            farmer: '',
            livestockGroup: '',
            animalPhotos: [],
            isInsured: false,
            isDeceased: false,
            status: 'pending',
            statusAt: '',
        };
    }
  
    getAll(): Observable<Livestock[]> {
      console.log('dawdaw')
      const test = this.http.get<Livestock[]>(this.baseUrl, { withCredentials: true });
      console.log('test', test)
      return test
    }
  
    getOne(id: string): Observable<Livestock> {
      return this.http.get<Livestock>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
  
    create(livestock: Livestock): Observable<Livestock> {
      return this.http.post<Livestock>(this.baseUrl, livestock, { withCredentials: true });
    }
  
    update(id: string, livestock: Livestock): Observable<Livestock> {
      return this.http.put<Livestock>(`${this.baseUrl}/${id}`, livestock, { withCredentials: true });
    }
  
    delete(id: string): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }

    uploadPhotos(livestockId: any, files: File[]): Observable<any> {
      const formData = new FormData();
      files.forEach(file => formData.append('photos', file));
      return this.http.put(`${this.baseUrl}/${livestockId}/photos`, formData, { withCredentials: true });
    }

    // should get this in the ts
    // make this transform the data to what is needed to be rendered
    getProfilePicture(animalPhotos: string): Observable<string> {
      const url = `${this.baseUrl}/${animalPhotos}/photo`;

      return this.http.get(url, { responseType: 'blob', withCredentials: true }).pipe(
        map(blob => URL.createObjectURL(blob))
      );
    }
}
