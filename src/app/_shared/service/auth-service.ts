import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { LoginResponse } from '../model/response/login-response';
import { UserDto } from '../model/user-dto';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserDto | null | undefined>(undefined);
  currentUser$ = this.currentUserSubject.asObservable();

  private hasCheckedAuthSubject = new BehaviorSubject<boolean>(false);
  hasCheckedAuth$ = this.hasCheckedAuthSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.checkAuthStatus().subscribe(); // automatically check on app load
  }


  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      '/auth/sign-in',
      { username, password },
      { withCredentials: true }
    );
  }

  logout() {
    return this.http.post('/auth/sign-out', {}, { withCredentials: true }).pipe(
      tap(() => this.currentUserSubject.next(null))
    );
  }

  getProfile(): Observable<UserDto> {
    return this.http.get<UserDto>('/api/users/profile', { withCredentials: true });
  }

  checkAuthStatus(): Observable<UserDto | null> {
    return this.getProfile().pipe(
      tap({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.hasCheckedAuthSubject.next(true);
        },
        error: () => {
          this.currentUserSubject.next(null);
          this.hasCheckedAuthSubject.next(true);
        }
      }),
      catchError(() => of(null))
    );
  }
}
