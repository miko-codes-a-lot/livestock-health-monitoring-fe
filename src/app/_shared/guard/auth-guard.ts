import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth-service';
import { combineLatest, map, take, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    const expectedRole = route.data['role'] as string;

    return combineLatest([
      this.authService.currentUser$,
      this.authService.hasCheckedAuth$
    ]).pipe(
      filter(([_, hasChecked]) => hasChecked), // wait until auth check is complete
      take(1),
      map(([user]) => {
        if (!user) {
          this.router.navigate(['/login']);
          return false; // ✅ block navigation
        }

        if (expectedRole && user.role !== expectedRole) {
          this.router.navigate(['/']);
          return false;
        }

        return true;
      })
    );
  }
}
