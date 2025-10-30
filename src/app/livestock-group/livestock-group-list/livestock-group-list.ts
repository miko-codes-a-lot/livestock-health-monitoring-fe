import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LivestockGroup } from '../../_shared/model/livestock-group';
import { LivestockGroupService } from '../../_shared/service/livestock-group-service';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-livestock-group-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    GenericTableComponent
  ],
  templateUrl: './livestock-group-list.html',
  styleUrls: ['./livestock-group-list.css']
})
export class LivestockGroupList implements OnInit {
  livestockGroups: LivestockGroup[] = [];
  isLoading = false;
  user: UserDto | null = null;

  dataSource = new MatTableDataSource<LivestockGroup>();

  // Table config
  displayedColumns = ['groupName', 'status', 'actions'];
  columnDefs = [
    { key: 'groupName', label: 'Group Name' },
    { key: 'status', label: 'Status' },
  ];

  constructor(
    private readonly livestockGroupService: LivestockGroupService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.authService.currentUser$.subscribe({
      next: (u) => this.user = u ?? null
    });

    this.livestockGroupService.getAll().subscribe({
      next: (groups) => {
        let filteredGroups = groups;
        if (this.user?.role === 'farmer') {
          filteredGroups = groups.filter(lg => this.isUserDto(lg.farmer) && lg.farmer._id === this.user?._id);

        } else {
          filteredGroups = groups.filter(lg => lg.status !== 'draft');
        }

        this.dataSource.data = filteredGroups;  // ✅ set MatTableDataSource data
      },
      error: (err) => alert(`Something went wrong: ${err}`),
    }).add(() => this.isLoading = false);
  }
  onCreate() {
    this.router.navigate(['/livestock-group/create']);
  }

  isUserDto(farmer: string | UserDto): farmer is UserDto {
    return typeof farmer !== 'string' && '_id' in farmer;
  }


  onDetails(id: string) {
    this.router.navigate(['/livestock-group/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/livestock-group/update', id]);
  }
}
