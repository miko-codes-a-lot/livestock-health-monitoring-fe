import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';

import { InsurancePolicy } from '../../_shared/model/insurance-policy';
import { InsurancePolicyService } from '../../_shared/service/insurance-policy-service';
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
  selector: 'app-insurance-policy-list',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, GenericTableComponent, MatIconModule, MatButtonModule],
  templateUrl: './insurance-policy-list.html',
  styleUrls: ['./insurance-policy-list.css']
})
export class InsurancePolicyList implements OnInit {
  dataSource = new MatTableDataSource<InsurancePolicy>();
  isLoading = false;
  user: UserDto | null = null;

  columnDefs: ColumnDef<InsurancePolicy>[] = [
    { key: 'policyNumber', label: 'Policy Number' },
    { key: 'provider', label: 'Provider' },
    { key: 'status', label: 'Status' },
    { 
      key: 'livestockGroup', 
      label: 'Livestock Group', 
      cell: lp => {
        if (!lp.livestockGroup) return 'N/A';
        return typeof lp.livestockGroup === 'string'
          ? lp.livestockGroup
          : (lp.livestockGroup as any).groupName || 'N/A';
      }
    },
    { key: 'createdAt', label: 'Created At' },
    { key: 'updatedAt', label: 'Updated At' }
  ];

  displayedColumnsKeys = [...this.columnDefs.map(c => c.key), 'actions'];

  constructor(
    private readonly insurancePolicyService: InsurancePolicyService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.authService.currentUser$.subscribe(u => this.user = u);

    this.insurancePolicyService.getAll().subscribe({
      next: (policies) => {
        if (this.user?.role === 'farmer') {
          this.dataSource.data = policies.filter(
            lp => this.isUserDto(lp.farmer) && lp.farmer._id === this.user?._id
          );
        } else {
          this.dataSource.data = policies;
        }
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => this.isLoading = false);
  }

  isUserDto(farmer: string | UserDto): farmer is UserDto {
    return typeof farmer !== 'string' && '_id' in farmer;
  }

  onCreate() {
    this.router.navigate(['/insurance-policy/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/insurance-policy/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/insurance-policy/update', id]);
  }

  get canCreate(): boolean {
    return !!this.user && this.user.role === 'technician';
  }
}
