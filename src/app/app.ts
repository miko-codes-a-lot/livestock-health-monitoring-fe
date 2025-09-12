import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './_shared/service/auth-service';
import { UserDto } from './_shared/model/user-dto';

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterOutlet,
    MatIconModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  user: UserDto | null = null
  isLoggedIn = false

  isLoading = false

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe({
      next: (user) => {
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
    this.isLoading = true

    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => alert(`Something went wrong: ${err}`),
    }).add(() => this.isLoading = false)
  }
}
