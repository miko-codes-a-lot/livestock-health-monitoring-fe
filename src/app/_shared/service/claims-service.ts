import { Injectable } from '@angular/core';
import { Claims } from '../model/claims';
import { Observable, map, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClaimsService {
    constructor(private readonly http: HttpClient) {}
    // private readonly baseUrl = '/livestocks';
    private readonly baseUrl = `/claims`;
    getEmptyOrNullDoc(): Claims {
      const now = new Date().toISOString();
      return {
        _id: '',
        animal: '',
        causeOfDeath: '',
        causeOfDeathCategory: '',
        createdAt: now,
        dateOfDeath: now,
        evidencePhotos: [],
        farmer: '',
        filedAt: now,
        policy: '',
        status: 'draft',
        updatedAt: now,
      };
    }
  
    getAll(): Observable<Claims[]> {
      const test = this.http.get<Claims[]>(this.baseUrl, { withCredentials: true });
      console.log('test', test)
      return test
    }
  
    getOne(id: string): Observable<Claims> {
      return this.http.get<Claims>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
  
    create(claims: Claims): Observable<Claims> {
      return this.http.post<Claims>(this.baseUrl, claims, { withCredentials: true });
    }
  
    update(id: string, claims: Claims): Observable<Claims> {
      return this.http.put<Claims>(`${this.baseUrl}/${id}`, claims, { withCredentials: true });
    }
  
    delete(id: string): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }

    uploadPhotos(claimsId: any, files: File[]): Observable<any> {
      const formData = new FormData();
      files.forEach(file => formData.append('photos', file));
      return this.http.put(`${this.baseUrl}/${claimsId}/photos`, formData, { withCredentials: true });
    }

    // should get this in the ts
    // make this transform the data to what is needed to be rendered
    // 
    // getProfilePicture(animalPhotos: string): Observable<string> {
    //   // redirect to existing route
    //   // url / animalId / photo
    //   const url = `${this.baseUrl}/${animalPhotos}/photo`;

    //   return this.http.get(url, { responseType: 'blob', withCredentials: true }).pipe(
    //     map(blob => URL.createObjectURL(blob))
    //   );
    // }

    getProfilePicture(filename: string): Observable<string> {
      const url = `${this.baseUrl}/${filename}/photo`;

      return this.http.get(url, { responseType: 'blob', withCredentials: true }).pipe(
        map(blob => URL.createObjectURL(blob))
      );
    }

    getProfilePictures(filenames: string[]): Observable<string[]> {
      return forkJoin(filenames.map(f => this.getProfilePicture(f)));
    }
}
