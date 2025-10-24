import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { InsurancePolicy } from '../../_shared/model/insurance-policy';
import { InsurancePolicyService } from '../../_shared/service/insurance-policy-service';


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
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.insurancePolicyService.getAll().subscribe({
      next: (insurancePolicy) => {
        this.insurancePolicies = insurancePolicy;
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => (this.isLoading = false));
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
