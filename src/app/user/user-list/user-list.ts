import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { UserDto } from '../../_shared/model/user-dto';
import { UserService } from '../../_shared/service/user-service';
import { AuthService } from '../../_shared/service/auth-service';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    GenericTableComponent
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserList implements OnInit, AfterViewInit, OnDestroy {

  users: UserDto[] = [];
  user: UserDto | null = null;
  isLoading = false;
  isMobile = false;
  mobilePagedData: UserDto[] = [];

  /** TABLE */
  dataSource = new MatTableDataSource<UserDto>();
  displayedColumns = [
    'username',
    'firstName',
    'middleName',
    'lastName',
    'emailAddress',
    'mobileNumber',
    'address',
    'gender',
    'role',
    'createdAt',
    'updatedAt',
    'actions'
  ];

  columnDefs = [
    { key: 'username', label: 'Username' },
    { key: 'firstName', label: 'Firstname' },
    { key: 'middleName', label: 'Middlename' },
    { key: 'lastName', label: 'Lastname' },
    { key: 'emailAddress', label: 'Email' },
    { key: 'mobileNumber', label: 'Mobile' },
    {
      key: 'address',
      label: 'Address',
      cell: (e: UserDto) =>
        `${e.address?.municipality || ''}, ${e.address?.barangay || ''}`
    },
    { key: 'gender', label: 'Gender' },
    { key: 'role', label: 'Role' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'updatedAt', label: 'Updated At' }
  ];

  /** BARANGAY FILTER */
  barangays: string[] = [];
  selectedBarangay = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  // ==============================
  // INIT
  // ==============================
  ngOnInit() {
    this.isLoading = true;
    this.updateIsMobile();
    window.addEventListener('resize', this.updateIsMobile.bind(this));

    this.authService.currentUser$.subscribe(currentUser => {
      this.user = currentUser;
      if (!currentUser) return;

      this.userService.getAll().subscribe({
        next: users => this.setupUsers(users, currentUser),
        error: err => {
          alert(`Something went wrong: ${err}`);
          this.isLoading = false;
        }
      });
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Sync mobile cards with paginator
    this.paginator.page.subscribe(() => {
      this.updateMobilePagedData();
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateIsMobile.bind(this));
  }

  // ==============================
  // DATA SETUP
  // ==============================
  private setupUsers(users: UserDto[], currentUser: UserDto) {
    let filteredUsers = users;

    /** TECHNICIAN VIEW */
    if (currentUser.role === 'technician') {
      filteredUsers = users.filter(u =>
        u.role === 'farmer' &&
        u.address?.barangay === currentUser.address?.barangay
      );

      this.columnDefs = this.columnDefs.filter(c => c.key !== 'role');
      this.displayedColumns = this.displayedColumns.filter(c => c !== 'role');
    }

    /** ADMIN BARANGAY LIST */
    if (currentUser.role === 'admin') {
      this.barangays = [
        ...new Set(
          filteredUsers
            .map(u => u.address?.barangay)
            .filter(Boolean)
        )
      ].sort();
    }

    this.dataSource.data = filteredUsers;

    /** SORT ACCESSOR */
    this.dataSource.sortingDataAccessor = (item, prop) => {
      if (prop === 'address') {
        return `${item.address?.municipality || ''} ${item.address?.barangay || ''}`.toLowerCase();
      }
      return (item as any)[prop]?.toString().toLowerCase() ?? '';
    };

    /** FILTER (SEARCH + BARANGAY) */
    this.dataSource.filterPredicate = (data, filter) => {
      const f = JSON.parse(filter);

      const matchesBarangay =
        !f.barangay ||
        data.address?.barangay === f.barangay;

      const searchable =
        (
          data.username +
          data.emailAddress +
          data.mobileNumber +
          data.gender +
          data.role +
          (data.address?.municipality || '') +
          (data.address?.barangay || '')
        ).toLowerCase();

      const matchesSearch = searchable.includes(f.search);

      return matchesBarangay && matchesSearch;
    };
    this.updateMobilePagedData();
    this.isLoading = false;
  }

  // ==============================
  // FILTERS
  // ==============================
  applyFilter(event: any) {
    const search = event.target.value.trim().toLowerCase();
    this.applyCombinedFilter(search);
  }

  onBarangayChange(barangay: string) {
    this.selectedBarangay = barangay;
    this.applyCombinedFilter();
  }

  private applyCombinedFilter(search: string = '') {
    this.dataSource.filter = JSON.stringify({
      search,
      barangay: this.selectedBarangay
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.updateMobilePagedData();
  }

  // ==============================
  // ACTIONS
  // ==============================
  onCreate() {
    this.router.navigate(['/user/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/user/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/user/update', id]);
  }

  // ==============================
  // UTILITIES
  // ==============================
  private updateIsMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  getCellValue(u: UserDto, col: any) {
    const value = col.cell ? col.cell(u) : (u as any)[col.key];
    // Guard against misplaced dates
    if (
      col.key === 'lastName' &&
      typeof value === 'string' &&
      !isNaN(Date.parse(value))
    ) {
      return '—';
    }

    if (this.isIsoDate(value)) return this.formatDate(value);
    return value || '—';
  }

  private isIsoDate(value: any): boolean {
    return typeof value === 'string' && !isNaN(Date.parse(value));
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private updateMobilePagedData() {
    const data = this.dataSource.filteredData;
    const paginator = this.dataSource.paginator;

    if (!paginator) {
      this.mobilePagedData = data;
      return;
    }

    const startIndex = paginator.pageIndex * paginator.pageSize;
    this.mobilePagedData = data.slice(
      startIndex,
      startIndex + paginator.pageSize
    );
  }
}
