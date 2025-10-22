import { Injectable } from '@angular/core';
import { LivestockClassification } from '../model/livestock-classification';
import { Observable, map, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

// everything is to update
export class LivestockClassificationService {
    constructor(private readonly http: HttpClient) {}
    // private readonly baseUrl = '/livestocks';
    private readonly baseUrl = `/livestock-classifications`;
    getEmptyOrNullDoc(): LivestockClassification {
      return {
        name: '',
        description: '',
        icon: '',
      };
    }
  
    getAll(): Observable<LivestockClassification[]> {
      const test = this.http.get<LivestockClassification[]>(this.baseUrl, { withCredentials: true });
      return test
    }
  
    getOne(id: string): Observable<LivestockClassification> {
      return this.http.get<LivestockClassification>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
  
    create(livestock: LivestockClassification): Observable<LivestockClassification> {
      return this.http.post<LivestockClassification>(this.baseUrl, livestock, { withCredentials: true });
    }
  
    update(id: string, livestock: LivestockClassification): Observable<LivestockClassification> {
      return this.http.put<LivestockClassification>(`${this.baseUrl}/${id}`, livestock, { withCredentials: true });
    }
  
    delete(id: string): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }

    uploadPhotos(livestockClassificationId: any, files: File[]): Observable<any> {
      const formData = new FormData();
      files.forEach(file => formData.append('photos', file));
      return this.http.put(`${this.baseUrl}/${livestockClassificationId}/photos`, formData, { withCredentials: true });
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
