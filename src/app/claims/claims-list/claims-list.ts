import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';

import { Claims } from '../../_shared/model/claims';
import { ClaimsService } from '../../_shared/service/claims-service';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface ColumnDef<T> {
  key: string;
  label: string;
  cell?: (element: T) => any;
}

@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    GenericTableComponent,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './claims-list.html',
  styleUrls: ['./claims-list.css']
})
export class ClaimsList implements OnInit {
  dataSource = new MatTableDataSource<Claims>();
  isLoading = false;
  user: UserDto | null = null;

  columnDefs: ColumnDef<Claims>[] = [
    { 
      key: 'animal', 
      label: 'Tag Number (Animal)', 
      cell: c => {
        const animalObj = c.animal as any;
        return animalObj?.tagNumber || 'N/A';
      }
    },
    { key: 'causeOfDeath', label: 'Cause of Death' },
    { key: 'dateOfDeath', label: 'Date of Death', cell: c => new Date(c.dateOfDeath).toLocaleDateString() },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'updatedAt', label: 'Updated At' }
  ];

  displayedColumnsKeys = [...this.columnDefs.map(c => c.key), 'actions'];

  constructor(
    private readonly claimsService: ClaimsService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.authService.currentUser$.subscribe(u => this.user = u ?? null);

    this.claimsService.getAll().subscribe({
      next: (claims) => {
        console.log('claims', claims)
        if (this.user?.role === 'farmer') {
          this.dataSource.data = claims.filter(
            c => this.isUserDto(c.farmer) && c.farmer._id === this.user?._id
          );
        } else {
          this.dataSource.data = claims.filter(c => c.status !== 'draft');
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

  get canCreate(): boolean {
    return !!this.user && this.user.role === 'farmer';
  }
}
