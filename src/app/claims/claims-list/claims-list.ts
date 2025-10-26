import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Claims } from '../../_shared/model/claims';
import { ClaimsService } from '../../_shared/service/claims-service';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';

@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './claims-list.html',
  styleUrls: ['./claims-list.css']
})
export class ClaimsList {
  claims: Claims[] = [];
  isLoading = false;

  user: UserDto | null = null; 

  displayedColumns: string[] = ['animal', 'farmer', 'causeOfDeath', 'dateOfDeath', 'status', 'action'];

  constructor(
    private readonly claimsService: ClaimsService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.authService.currentUser$.subscribe({
      next: (u) => {
        if (u) {
          this.user = u
        }
      }
    })

    this.claimsService.getAll().subscribe({
      next: (claims) => {
        this.claims = claims;

        if (this.user?.role === 'farmer') {
          // Show only the logged-in farmer's livestock groups
          this.claims = claims.filter(
            c => this.isUserDto(c.farmer) && c.farmer._id === this.user?._id
          );
          // this.livestockGroups = livestockGroups.filter(lg => lg.farmer?._id === this.user?._id);
        } else {
          // Show all for admin/other roles
          this.claims = claims.filter(
            c => c.status !== 'draft'
          );
        }
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => (this.isLoading = false));
  }

  isUserDto(farmer: string | UserDto): farmer is UserDto {
    return typeof farmer !== 'string' && '_id' in farmer;
  }

  onCreate() {
    this.router.navigate(['/claims/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/claims/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/claims/update', id]);
  }
}
