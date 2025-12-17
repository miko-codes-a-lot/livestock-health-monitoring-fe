import { Component, OnInit, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserDto } from '../../_shared/model/user-dto';
import { UserService } from '../../_shared/service/user-service';
import { AuthService } from '../../_shared/service/auth-service';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    GenericTableComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule

  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})

export class UserList implements OnInit, AfterViewInit {

  users: UserDto[] = [];
  isLoading = false;
  user: UserDto | null = null;
  isMobile = false;
  displayedColumns = ['username', 'firstName', 'middleName', 'lastName', 'emailAddress', 'mobileNumber', 'address', 'gender', 'role', 'createdAt', 'updatedAt', 'actions'];
  columnDefs = [
    { key: 'username', label: 'Username' },
    { key: 'firstName', label: 'Firstname' },
    { key: 'middleName', label: 'Middlename' },
    { key: 'lastName', label: 'Lastname' },
    { key: 'emailAddress', label: 'Email' },
    { key: 'mobileNumber', label: 'Mobile' },
    { key: 'address', label: 'Address', cell: (e: UserDto) => `${e.address?.municipality || ''}, ${e.address?.barangay || ''}` },
    { key: 'gender', label: 'Gender' },
    { key: 'role', label: 'Role' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'updatedAt', label: 'Updated At' }
  ];

  dataSource = new MatTableDataSource<UserDto>();
  groupedUsers: { barangay: string; users: UserDto[]; dataSource: MatTableDataSource<UserDto>; }[] = [];

  @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>;
  @ViewChildren(MatSort) sorts!: QueryList<MatSort>;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.updateIsMobile();
    window.addEventListener('resize', () => this.updateIsMobile());

    this.authService.currentUser$.subscribe(currentUser => {
      this.user = currentUser ?? null;

      if (currentUser == null) return;

      this.userService.getAll().subscribe({
        next: users => {
          let filteredUsers = users;

          if (this.user?.role === 'technician') {
            filteredUsers = users.filter(u => 
              u.role === 'farmer'
              && u.address.barangay === currentUser?.address.barangay
            );
            this.columnDefs = this.columnDefs.filter(c => c.key !== 'role');
          }

          this.users = filteredUsers;
          if (this.user?.role === 'admin') {
            // GROUP BY BARANGAY
            const groups: any = {};
            filteredUsers.forEach(u => {
              const brgy = u.address?.barangay || 'No Barangay';
              if (!groups[brgy]) groups[brgy] = [];
              groups[brgy].push(u);
            });

            this.groupedUsers = Object.keys(groups).map(brgy => ({
              barangay: brgy,
              users: groups[brgy],
              dataSource: new MatTableDataSource(groups[brgy])
            }));

          } else {
            this.dataSource.data = filteredUsers;
            this.dataSource.sortingDataAccessor = (item, prop) => prop === 'address'
              ? `${item.address?.municipality || ''} ${item.address?.barangay || ''}`.toLowerCase()
              : (item as any)[prop]?.toString().toLowerCase() ?? '';
            this.dataSource.filterPredicate = (data, filter) => {
              const str = (
                data.username + data.emailAddress + data.mobileNumber + data.gender +
                data.role + (data.address?.municipality || '') + (data.address?.barangay || '')
              ).toLowerCase();
              return str.includes(filter);
            };
          }

          this.isLoading = false;
        },
        error: err => {
          alert(`Something went wrong: ${err}`);
          this.isLoading = false;
        }
      });
    });
  }

  ngAfterViewInit() {
    // Attach paginators and sort for grouped tables
    if (this.user?.role === 'admin') {
      this.sorts.changes.subscribe(() => {
        this.groupedUsers.forEach((g, i) => {
          g.dataSource.paginator = this.paginators.toArray()[i];
          g.dataSource.sort = this.sorts.toArray()[i];
        });
      })
    } else {
      if (this.paginators && this.paginators.first) {
        this.dataSource.paginator = this.paginators.first;
        if (this.sorts && this.sorts.first) this.dataSource.sort = this.sorts.first;
      }
    }
  }

  onCreate() { this.router.navigate(['/user/create']); }
  onDetails(id: string) { this.router.navigate(['/user/details', id]); }
  onUpdate(id: string) { this.router.navigate(['/user/update', id]); }

  applyFilter(event: any) {
    const filterValue = event.target.value.trim().toLowerCase();
    if (this.user?.role === 'admin') {
      this.groupedUsers.forEach(g => g.dataSource.filter = filterValue);
    } else {
      this.dataSource.filter = filterValue;
    }
  }

  applyFilterPerTable(event: Event, index: number) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.groupedUsers[index].dataSource.filter = filterValue;
  }

  private updateIsMobile() {
    this.isMobile = window.innerWidth <= 768; // or your breakpoint
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => this.updateIsMobile());
  }

  getCellValue(u: UserDto, col: any) {
    const value = col.cell ? col.cell(u) : (u as any)[col.key];
    if (this.isIsoDate(value)) {
      return this.formatDate(value);
    }
    return value
  }

  isIsoDate(value: any): boolean {
    if (typeof value !== 'string') return false;
    return !isNaN(Date.parse(value));
  }

  formatDate(value: string): string {
    const date = new Date(value);
    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}
