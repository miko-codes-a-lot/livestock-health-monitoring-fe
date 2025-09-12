import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginResponse } from '../model/response/login-response';
import { MockService } from './mock-service';
import { UserDto } from '../model/user-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserDto | null>(null)
  currentUser$: Observable<UserDto | null> = this.currentUserSubject.asObservable()

  constructor(private readonly mockService: MockService) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return new Observable<LoginResponse>((s) => {
      setTimeout(() => {
        s.next(
          {
            message: 'ok',
            user: this.mockService.mockUser()
          }
        )
        s.complete()
      }, 500);
    }).pipe(
      tap(({ user }) => this.currentUserSubject.next(user))
    )
  }

  logout() {
    return new Observable((s) => {
      setTimeout(() => {
        s.next(null)
        s.complete()
      }, 500);
    }).pipe(
      tap(() => this.currentUserSubject.next(null))
    )
  }


  getProfile(): Observable<UserDto> {
    return new Observable<UserDto>((s) => {
      setTimeout(() => {
        s.next(this.mockService.mockUser())
        s.complete()
      }, 500);
    })
  }

  checkAuthStatus(): void {
    this.getProfile().subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.currentUserSubject.next(null)
    })
  }

  get currentUserValue(): UserDto | null {
    return this.currentUserSubject.value
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue
  }
  
}
