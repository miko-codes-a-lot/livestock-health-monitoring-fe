import { Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';

import { Livestock } from '../../_shared/model/livestock';
import { LivestockService } from '../../_shared/service/livestock-service';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { configureTable } from '../../utils/table/configure-table';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

interface ColumnDef<T> {
  key: string;
  label: string;
  cell?: (element: T) => any;
}

@Component({
  selector: 'app-livestock-list',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    GenericTableComponent,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './livestock-list.html',
  styleUrls: ['./livestock-list.css']
})
export class LivestockList implements OnInit {
  dataSource = new MatTableDataSource<Livestock>();
  isLoading = false;
  user: UserDto | null = null;

  searchText = '';
  sortField = 'tagNumber';

  pagedData: Livestock[] = [];
  pageSize = 5;
  pageIndex = 0;

  // columnDefs: ColumnDef<Livestock>[] = [
  //   { key: 'tagNumber', label: 'Tag Number', cell: el => el.tagNumber },
  //   { key: 'species', label: 'Species', cell: el => el.species || '—' },
  //   { key: 'breed', label: 'Breed', cell: el => el.breed || '—' },
  //   { key: 'sex', label: 'Sex', cell: el => el.sex },
  //   { key: 'age', label: 'Age', cell: el => el.age },
  //   { key: 'farmer', label: 'Farmer', cell: el => el.farmer || '—' },
  //   { key: 'status', label: 'Status', cell: el => el.status },
  // ];

  columnDefs = [
    { key: 'tagNumber', label: 'Tag Number' },
    { key: 'species', label: 'Species',
      cell: (element: any) => element.species?.name || '—'},
    { key: 'breed', label: 'Breed',
      cell: (element: any) => element.breed?.name || '—'},
    { key: 'sex', label: 'Sex'},
    { key: 'age', label: 'Age'},
    {
      key: 'farmer.address.barangay',
      label: 'Barangay',
      cell: (element: any) => element.farmer?.address.barangay || '—'
    },
    { key: 'status', label: 'Status' },
  ];

  displayedColumnsKeys = [...this.columnDefs.map(c => c.key), 'actions'];

  constructor(
    private readonly livestockService: LivestockService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.isLoading = true;

    this.authService.currentUser$.subscribe(u => this.user = u);

    this.livestockService.getAll().subscribe({
      next: (livestock) => {
        let filtered: Livestock[];
        if (this.user?.role === 'farmer') {
          filtered = livestock.filter(
            l => this.getFarmerId(l.farmer) === this.user?._id
          );
        } else {
          filtered = livestock.filter(l => l.status !== 'draft');
        }
        this.dataSource.data = filtered;

        this.applyFilters();
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => (this.isLoading = false));
  }

  ngAfterViewInit() {
    // sorting & filtering for nested fields
    configureTable(this.dataSource, ['farmer.address.barangay', 'species.name', 'breed.name'])
  }


  getFarmerId(farmer: string | { _id: string }) {
    return typeof farmer === 'string' ? farmer : farmer._id;
  }

  // Event handlers for GenericTableComponent
  onCreate() {
    this.router.navigate(['/livestock/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/livestock/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/livestock/update', id]);
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
        const matchesTag = String(item.tagNumber).toLowerCase().includes(s);
        const matchesSpecies = String(this.getSpeciesName(item.species) || '').toLowerCase().includes(s);
        const matchesBreed = String(this.getBreedName(item.breed) || '').toLowerCase().includes(s);
        const matchesBarangay = this.isUserDto(item.farmer) && item.farmer.address?.barangay?.toLowerCase().includes(s);
        const matchesStatus = String(item.status).toLowerCase().includes(s);

        return matchesTag || matchesSpecies || matchesBreed || matchesBarangay || matchesStatus;
      });
    }

    // SORT
    data.sort((a, b) => {
      const valA = String(a[this.sortField as keyof Livestock] || '').toLowerCase();
      const valB = String(b[this.sortField as keyof Livestock] || '').toLowerCase();
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

  isUserDto(farmer: string | UserDto): farmer is UserDto {
    return typeof farmer !== 'string' && '_id' in farmer;
  }

  
  getSpeciesName(species: any): string {
    return species?.name || species || '—';
  }

  getBreedName(breed: any): string {
    return breed?.name || breed || '—';
  }

}
