import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MockService } from './mock-service';
import { io, Socket } from 'socket.io-client';
import { Notification } from '../model/notification';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket?: Socket
  private notifications$$ = new BehaviorSubject<Notification[]>([])

  public notifications$: Observable<Notification[]> = this.notifications$$.asObservable()
  private audio = new Audio('assets/sounds/notification.wav');

  private readonly apiUrl = `/notifications`;

  constructor(
    private readonly mockService: MockService,
    private readonly http: HttpClient,
  ) {}

  // call on login in app.ts ngOnInit
  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(`http://localhost:3000/notifications`, {
      withCredentials: true,
      // transports: ['websocket'],
    })

    this.socket.on('connect', () => {
      console.log('Successfully connected to WebSocket server.');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server. Reason:', reason);
    });

    this.socket.on('new_notification', (notification: Notification) => {
      console.log('New notification received:', notification);

      // Get the current list of notifications and add the new one to the top
      const currentNotifications = this.notifications$$.getValue();
      this.notifications$$.next([notification, ...currentNotifications]);

      this.playNotificationSound();
    });
  }

  // call on logout
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifications => {
        // Once fetched, update the BehaviorSubject with the full list
        this.notifications$$.next(notifications);
      })
    );
  }

  getOne(id: string): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(updatedNotification => {
        // For a snappier UI, we update the local state immediately
        // instead of re-fetching the entire list.
        const currentNotifications = this.notifications$$.getValue();
        const updatedList = currentNotifications.map(n =>
          n._id === id ? { ...n, read: true } : n
        );
        this.notifications$$.next(updatedList);
      })
    );
  }

  private playNotificationSound() {
    this.audio.currentTime = 0; 
    
    this.audio.play().catch(err => {
      console.warn('Could not play notification sound (Autoplay policy):', err);
    });
  }
}
