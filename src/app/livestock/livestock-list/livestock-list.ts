import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Livestock } from '../../_shared/model/livestock';
import { LivestockService } from '../../_shared/service/livestock-service';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';

@Component({
  selector: 'app-livestock-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './livestock-list.html',
  styleUrls: ['./livestock-list.css']
})
export class LivestockList {
  livestocks: Livestock[] = [];
  isLoading = false;
  user: UserDto | null = null; 

  displayedColumns = [
    'tagNumber',
    'species',
    'breed',
    'sex',
    'age',
    'status',
    'action'
  ];

  constructor(
    private readonly livestockService: LivestockService,
    private readonly router: Router,
    private readonly authService: AuthService,
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

    this.livestockService.getAll().subscribe({
      next: (livestock) => {
        if (this.user?.role === 'farmer') {
        // Show only the logged-in farmer's livestock groups
        this.livestocks = livestock.filter(
          l => l.farmer === this.user?._id
        );
        } else {
          // Show all for admin/other roles
          this.livestocks = livestock.filter(
            l => l.status !== 'draft'
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
    this.router.navigate(['/livestock/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/livestock/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/livestock/update', id]);
  }
}
