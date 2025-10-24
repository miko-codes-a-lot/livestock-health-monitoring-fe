import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { InsurancePolicy } from '../../_shared/model/insurance-policy';
import { InsurancePolicyService } from '../../_shared/service/insurance-policy-service';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';

@Component({
  selector: 'app-insurance-policy-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './insurance-policy-list.html',
  styleUrls: ['./insurance-policy-list.css']
})
export class InsurancePolicyList {
  insurancePolicies: InsurancePolicy[] = [];
  isLoading = false;
  user: UserDto | null = null; 

  // to continue here
  displayedColumns = [
    'policyNumber',
    'provider',
    'status',
    'farmer',
    'livestockGroup',
    // 'startDate',
    // 'endDate',
    'action'
  ];

  constructor(
    private readonly insurancePolicyService: InsurancePolicyService,
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

    this.insurancePolicyService.getAll().subscribe({
      next: (insurancePolicy) => {
          this.insurancePolicies = insurancePolicy;

          if (this.user?.role === 'farmer') {
          // Show only the logged-in farmer's livestock groups
          this.insurancePolicies = insurancePolicy.filter(
            lg => this.isUserDto(lg.farmer) && lg.farmer._id === this.user?._id
          );
            // this.livestockGroups = livestockGroups.filter(lg => lg.farmer?._id === this.user?._id);
            console.log('this.livestockGroups', this.insurancePolicies)
          } else {
            // Show all for admin/other roles
            this.insurancePolicies = insurancePolicy;
          }
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => (this.isLoading = false));
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
}
