import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';

import { Livestock } from '../../_shared/model/livestock';
import { LivestockService } from '../../_shared/service/livestock-service';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';

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
    GenericTableComponent
  ],
  templateUrl: './livestock-list.html',
  styleUrls: ['./livestock-list.css']
})
export class LivestockList implements OnInit {
  dataSource = new MatTableDataSource<Livestock>();
  isLoading = false;
  user: UserDto | null = null;

  columnDefs: ColumnDef<Livestock>[] = [
    { key: 'tagNumber', label: 'Tag Number' },
    { 
      key: 'species', 
      label: 'Species', 
      cell: (e) => typeof e.species === 'string' ? e.species : (e.species as any).name || 'N/A'
    },
    { 
      key: 'breed', 
      label: 'Breed', 
      cell: (e) => typeof e.breed === 'string' ? e.breed : (e.breed as any).name || 'N/A'
    },
    { key: 'sex', label: 'Sex' },
    { key: 'age', label: 'Age' },
    { key: 'status', label: 'Status' },
  ];

  displayedColumnsKeys = [...this.columnDefs.map(c => c.key), 'actions'];

  constructor(
    private readonly livestockService: LivestockService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.authService.currentUser$.subscribe(u => this.user = u);

    this.livestockService.getAll().subscribe({
      next: (livestock) => {
        let filtered: Livestock[];
        if (this.user?.role === 'farmer') {
          filtered = livestock.filter(
            l => l.farmer === this.user?._id // farmer is string now
          );
        } else {
          filtered = livestock.filter(l => l.status !== 'draft');
        }
        this.dataSource.data = filtered;
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => (this.isLoading = false));
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
}
