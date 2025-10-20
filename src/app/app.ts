import { Component, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './_shared/service/auth-service';
import { UserDto } from './_shared/model/user-dto';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterOutlet,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatToolbarModule,
    MatDrawer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild('drawer') drawer!: MatDrawer;

  user: UserDto | null = null
  isLoggedIn = false

  isLoading = false

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  toggleDrawer() {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if(user)
        this.user = user
        this.isLoggedIn = this.user !== null
      }
    })
  }

  redirectDashboard() {
    if (!this.user) return

    this.router.navigate([`/dashboard/${this.user.role}`])
  }

  onLogout() {
    this.isLoading = true;

    this.authService.logout().subscribe({
      next: () => {
        this.isLoggedIn = false;  // <-- hide drawer
        this.router.navigate(['/login']);
      },
      error: (err) => alert(`Something went wrong: ${err}`),
    }).add(() => this.isLoading = false);
  }
}
