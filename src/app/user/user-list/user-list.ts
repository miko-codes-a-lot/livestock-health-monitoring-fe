import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserDto } from '../../_shared/model/user-dto';
import { UserService } from '../../_shared/service/user-service';
import { AuthService } from '../../_shared/service/auth-service';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    GenericTableComponent
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserList implements OnInit {

  users: UserDto[] = [];
  isLoading = false;
  user: UserDto | null = null;

  // Table config
  displayedColumns = ['username', 'emailAddress', 'mobileNumber', 'address', 'gender', 'role', 'actions'];
  columnDefs = [
    { key: 'username', label: 'Username' },
    { key: 'emailAddress', label: 'Email' },
    { key: 'mobileNumber', label: 'Mobile' },
    { key: 'address', label: 'Address', cell: (e: UserDto) => `${e.address?.municipality || ''}, ${e.address?.barangay || ''}` },
    { key: 'gender', label: 'Gender' },
    { key: 'role', label: 'Role' }
  ];

  dataSource = new MatTableDataSource<UserDto>();

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.authService.currentUser$.subscribe(u => this.user = u ?? null);

    this.userService.getAll().subscribe({
      next: (users) => {
        let filteredUsers = users;

        if (this.user?.role === 'technician') {
          filteredUsers = users.filter(u => u.role === 'farmer');
          // Remove role column if technician
          this.columnDefs = this.columnDefs.filter(c => c.key !== 'role');
        }

        this.users = [...filteredUsers];
        this.dataSource.data = filteredUsers;

        // Sorting for nested address
        this.dataSource.sortingDataAccessor = (item, property) => {
          if (property === 'address') {
            return `${item.address?.municipality || ''} ${item.address?.barangay || ''}`.toLowerCase();
          }
          const value = (item as any)[property];
          return typeof value === 'string' ? value.toLowerCase() : value;
        };

        // Filtering (username + email + mobile + gender + role + nested address)
        this.dataSource.filterPredicate = (data: UserDto, filter: string) => {
          const searchStr = (
            data.username +
            data.emailAddress +
            data.mobileNumber +
            data.gender +
            data.role +
            (data.address?.municipality || '') +
            (data.address?.barangay || '')
          ).toLowerCase();
          return searchStr.includes(filter);
        };

        this.isLoading = false;
      },
      error: (err) => {
        alert(`Something went wrong: ${err}`);
        this.isLoading = false;
      }
    });
  }

  onCreate() {
    this.router.navigate(['/user/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/user/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/user/update', id]);
  }
}
