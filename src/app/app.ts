import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavComponent } from './_shared/component/nav/nav.component';
import { AuthService } from './_shared/service/auth-service';
import { CommonModule } from '@angular/common';
import { UserDto } from './_shared/model/user-dto';

// <-- Put the interface here
interface MenuItem {
  label: string;
  icon: string;
  link: string;
  roles?: string[]; // optional, if missing assume visible to all
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    NavComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isLoading = false
  isLoggedIn = false
  user: UserDto | null = null
  activeTitle = 'Dashboard'; // default title
  activeIcon = 'dashboard';  // default icon
  showTopNav = false;
  showSideNav = true;

  menuItems: MenuItem[] = []; // <-- use the interface type


  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe({
      next: (user) => {
          if (user) {
            this.user = user

              this.menuItems = [
                { label: 'Dashboard', icon: 'dashboard', link: `/dashboard/${user.role}`, roles: ['admin', 'farmer', 'technician'] },
                { label: 'User', icon: 'group', link: '/user', roles: ['admin', 'technician']  },
                { label: 'Livestock Classification', icon: 'category', link: '/livestock-classification', roles: ['admin', 'technician']  },
                { label: 'Livestock Breed', icon: 'pets', link: '/livestock-breed', roles: ['admin', 'technician']  },
                { label: 'Livestock Group', icon: 'groups', link: '/livestock-group', roles: ['admin', 'technician', 'farmer']  },
                { label: 'Livestock', icon: 'grass', link: '/livestock', roles: ['admin', 'technician', 'farmer']  },
                { label: 'Health Record', icon: 'medical_services', link: '/health-record', roles: ['admin', 'technician']  },
                { label: 'Insurance Policy', icon: 'verified_user', link: '/insurance-policy', roles: ['admin', 'technician', 'farmer']  },
                { label: 'Claims', icon: 'assignment', link: '/claims', roles: ['admin', 'technician', 'farmer']  },
              ];
          }
          this.isLoggedIn = !!user;
          this.updateTopNavVisibility();
      }
    })

        // Update activeTitle based on current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentRoute = this.menuItems.find(item => event.urlAfterRedirects.startsWith(item.link));
        this.activeTitle = currentRoute ? currentRoute.label : 'Dashboard';
        this.activeIcon = currentRoute ? currentRoute.icon : 'dashboard';
        // get back in this later
        // hide side nave when user settings
        const url = event.urlAfterRedirects;
        this.showSideNav = !url.startsWith('/user-settings');
        this.updateTopNavVisibility(event.urlAfterRedirects);
    });
  }

  // Utility to decide whether top nav should show
  updateTopNavVisibility(url?: string) {
    const currentUrl = url || this.router.url;
    // Hide on login page or if not logged in
    this.showTopNav = this.isLoggedIn && !currentUrl.includes('/login');
  }

  goToUserSettings() {
    this.router.navigate(['/user-settings/index'])
  }

  onClickLogout() {
    this.isLoading = true

    this.authService.logout()
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => alert(`Something went wrong: ${err}`)
      })
      .add(() => this.isLoading = false)
  }

  get filteredMenuItems(): MenuItem[] {
    if (!this.user) return [];
    return this.menuItems.filter(item => {
      // If roles is not defined, allow all
      if (!item.roles) return true;
      // Only include if user's role is in roles
      return this.user?.role ? item.roles.includes(this.user.role) : false;
    });
  }
}
