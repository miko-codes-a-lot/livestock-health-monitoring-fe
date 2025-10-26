import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LivestockGroup } from '../../_shared/model/livestock-group';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';


@Component({
  selector: 'app-livestock-group-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './livestock-group-list.html',
  styleUrls: ['./livestock-group-list.css']
})
export class LivestockGroupList {
  livestockGroups: LivestockGroup[] = [];
  isLoading = false;

  user: UserDto | null = null; 

  displayedColumns = [
    'groupName',
    'farmer',
    'status',
    'action'
  ];

  constructor(
    private readonly livestockGroupService: LivestockGroupService,
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

    this.livestockGroupService.getAll().subscribe({
      next: (livestockGroups) => {
        if (this.user?.role === 'farmer') {
          // Show only the logged-in farmer's livestock groups
        this.livestockGroups = livestockGroups.filter(
          lg => this.isUserDto(lg.farmer) && lg.farmer._id === this.user?._id
        );
          // this.livestockGroups = livestockGroups.filter(lg => lg.farmer?._id === this.user?._id);
          console.log('this.livestockGroups', this.livestockGroups)
        } else {
          // Show all for admin/other roles
          this.livestockGroups = livestockGroups.filter(
            ls => ls.status !== 'draft'
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
    this.router.navigate(['/livestock-group/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/livestock-group/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/livestock-group/update', id]);
  }
}
