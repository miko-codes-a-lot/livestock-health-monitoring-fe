import { Injectable } from '@angular/core';
import { MortalityCause } from '../model/mortality-cause';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MortalityCauseService {
    constructor(private readonly http: HttpClient) {}
    private readonly baseUrl = `/mortality-causes`;

    getAll(): Observable<MortalityCause[]> {
      const result = this.http.get<MortalityCause[]>(this.baseUrl, { withCredentials: true });
      console.log('result', result)
      return result
    }

}
