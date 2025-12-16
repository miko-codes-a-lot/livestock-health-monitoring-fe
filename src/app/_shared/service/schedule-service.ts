import { Injectable } from '@angular/core';
import { Schedule } from '../model/schedule';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

// everything is to update
export class ScheduleService {
    constructor(private readonly http: HttpClient) {}
    private readonly baseUrl = `/schedules`;
    getEmptyOrNullDoc(): Schedule {
      return {
        _id: '',
        animal: '',
        healthRecord: '',
        createdBy: '',
        assignedVet: '',
        farmer: '',
        type: 'vaccination', // default type
        scheduledDate: new Date(), // or '' if you prefer empty
        status: 'pending', // default status
      };
    }

  
    getAll(): Observable<Schedule[]> {
      const test = this.http.get<Schedule[]>(this.baseUrl, { withCredentials: true });
      return test
    }
  
    getOne(id: string): Observable<Schedule> {
      return this.http.get<Schedule>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }
  
    create(schedule: Schedule): Observable<Schedule> {
      console.log('create schedule: ', schedule)
      return this.http.post<Schedule>(this.baseUrl, schedule, { withCredentials: true });
    }
  
    update(id: string, schedule: Schedule): Observable<Schedule> {
      return this.http.put<Schedule>(`${this.baseUrl}/${id}`, schedule, { withCredentials: true });
    }
  
    delete(id: string): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }

    updateStatus(id: string, status: object): Observable<Schedule> {
      const result = this.http.patch<Schedule>(`${this.baseUrl}/${id}/process`, status);
      return result
    }

}
