import { Injectable } from '@angular/core';
import { Livestock } from '../model/livestock';
import { Observable, map, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FullLivestock } from '../model/response/full-livestock';

export type LivestockGroupStatus =  'draft' | 'pending' | 'approved' | 'rejected' | 'verified';

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
            status: 'draft',
            statusAt: '',
        };
    }
  
    getAll(): Observable<Livestock[]> {
      const test = this.http.get<Livestock[]>(this.baseUrl);
      return test
    }
  
    getOne(id: string): Observable<FullLivestock> {
      return this.http.get<FullLivestock>(`${this.baseUrl}/${id}`);
    }

    getOneSimple(id: string): Observable<Livestock> {
      return this.getOne(id).pipe(
        map((fullAnimal: FullLivestock): Livestock => {
          
          const simpleAnimal: Livestock = {
            ...fullAnimal,
            species: fullAnimal.species._id!!,
            breed: fullAnimal.breed._id!!,
          };

          return simpleAnimal;
        })
      );
    }
  
    create(livestock: Livestock): Observable<Livestock> {
      return this.http.post<Livestock>(this.baseUrl, livestock);
    }
  
    update(id: string, livestock: Livestock): Observable<Livestock> {
      return this.http.put<Livestock>(`${this.baseUrl}/${id}`, livestock);
    }
  
    delete(id: string): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    uploadPhotos(livestockId: any, files: File[]): Observable<any> {
      const formData = new FormData();
      files.forEach(file => formData.append('photos', file));
      return this.http.put(`${this.baseUrl}/${livestockId}/photos`, formData);
    }

    updateGroupStatus(groupId: string, status: LivestockGroupStatus): Observable<{ message: string }> {
      return this.http.patch<{ message: string }>(
        `${this.baseUrl}/group/${groupId}/status`,
        { status },
        { withCredentials: true } // if you need cookies/session
      );
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
