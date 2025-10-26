import { Injectable } from '@angular/core';
import { LivestockGroup } from '../model/livestock-group';
import { Observable, map, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FullLivestockGroup } from '../model/response/full-livestock-group';
import { FullLivestock } from '../model/response/full-livestock';
import { Livestock } from '../model/livestock';

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
        status: 'draft',        // default status
        createdAt: now,           // current timestamp
        updatedAt: now,           // current timestamp
        statusAt: now,            // current timestamp
      };
    }

    // uploadGroupPhotos

    uploadGroupPhotos(livestockGroupId: any, files: File[]): Observable<any> {
      const formData = new FormData();
      files.forEach(file => formData.append('photos', file));
      return this.http.put(`${this.baseUrl}/${livestockGroupId}/photos`, formData, { withCredentials: true });
    }

    getGroupPhoto(filename: string): Observable<string> {
      const url = `${this.baseUrl}/${filename}/photo`;

      return this.http.get(url, { responseType: 'blob', withCredentials: true }).pipe(
        map(blob => URL.createObjectURL(blob))
      );
    }

    getGroupPhotos(filenames: string[]): Observable<string[]> {
      return forkJoin(filenames.map(f => this.getGroupPhoto(f)));
    }

    getAll(): Observable<LivestockGroup[]> {
      return this.http.get<LivestockGroup[]>(this.baseUrl, { withCredentials: true });
    }
  
    getOne(id: string): Observable<FullLivestockGroup> {
      return this.http.get<FullLivestockGroup>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }

    getOneSimple(id: string): Observable<LivestockGroup> {
      return this.getOne(id).pipe(
        map((fullDoc: FullLivestockGroup): LivestockGroup => {
          
          const mappedGroup: LivestockGroup = {
            ...fullDoc,
            
            livestocks: fullDoc.livestocks 
              ? fullDoc.livestocks.map((fullAnimal: FullLivestock): Livestock => {
                  return {
                    ...fullAnimal,
                    
                    species: fullAnimal.species.name,
                    breed: fullAnimal.breed.name,
                  };
                }) 
              : []
          };

          return mappedGroup;
        })
    );
  }
  
    create(livestockGroup: LivestockGroup): Observable<LivestockGroup> {
      return this.http.post<LivestockGroup>(this.baseUrl, livestockGroup, { withCredentials: true });
    }
  
    update(id: string, livestockGroup: LivestockGroup): Observable<LivestockGroup> {
      return this.http.put<LivestockGroup>(`${this.baseUrl}/${id}`, livestockGroup, { withCredentials: true });
    }

    updateStatus(id: string, status: object): Observable<LivestockGroup> {
      const result = this.http.patch<LivestockGroup>(`${this.baseUrl}/${id}/status`, status, { withCredentials: true });
      return result
    }
  
    delete(id: string): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
}
