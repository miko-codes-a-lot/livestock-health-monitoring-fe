import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { configureTable } from '../../utils/table/configure-table';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-livestock-group-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    GenericTableComponent,
    FormsModule
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
  displayedColumns = ['groupName', 'farmer.address.barangay', 'status', 'actions'];
  columnDefs = [
    { key: 'groupName', label: 'Group Name' },
    {
      key: 'farmer.address.barangay',
      label: 'Barangay',
      cell: (element: any) => element.farmer?.address.barangay || '—'
    },
    { key: 'status', label: 'Status' },
  ];

  searchText = '';
  sortField = 'groupName';

  pagedData: LivestockGroup[] = [];
  pageSize = 5;
  pageIndex = 0;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

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
        
        this.dataSource.data = filteredGroups;

        this.applyFilters();
      },
      error: (err) => alert(`Something went wrong: ${err}`),
    }).add(() => this.isLoading = false);

    this.applyFilters();

  }

  ngAfterViewInit() {
    // sorting & filtering for nested fields

    setTimeout(() => {
      if (this.paginator) {
        this.paginator.page.subscribe((event) => this.onPageChange(event));
      }
    });
    configureTable(this.dataSource, ['farmer.address.barangay'])
  }

  /**
   * Helper to safely get nested values from an object using a path like "farmer.address.barangay"
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((value, key) => value?.[key], obj);
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

  get canCreate(): boolean {
    return !!this.user && this.user.role === 'farmer';
  }

  applyFilters() {
    let data = [...this.dataSource.data];

    // SEARCH
    if (this.searchText.trim()) {
      const s = this.searchText.toLowerCase();
      data = data.filter(item => {

        if(this.isUserDto(item.farmer)) {
          const matchesGroupName = item.groupName.toLowerCase().includes(s);

          const matchesBarangay = item.farmer.address?.barangay?.toLowerCase().includes(s);

          return matchesBarangay || matchesGroupName;
        }

        return null

      });
    }

    // SORT
    data.sort((a, b) => {
      const valA = (this.getNestedValue(a, this.sortField) || '').toString().toLowerCase();
      const valB = (this.getNestedValue(b, this.sortField) || '').toString().toLowerCase();
      return valA.localeCompare(valB);
    });

    // PAGINATION
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;

    this.pagedData = data.slice(start, end);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyFilters();
  }

  onSearchChange() {
    this.pageIndex = 0;
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

}
