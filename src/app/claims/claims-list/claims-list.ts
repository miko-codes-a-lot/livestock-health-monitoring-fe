import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Claims } from '../../_shared/model/claims';
import { ClaimsService } from '../../_shared/service/claims-service';


@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './claims-list.html',
  styleUrls: ['./claims-list.css']
})
export class ClaimsList {
  claims: Claims[] = [];
  isLoading = false;

displayedColumns: string[] = ['animal', 'farmer', 'causeOfDeath', 'dateOfDeath', 'status', 'action'];

  constructor(
    private readonly claimsService: ClaimsService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.claimsService.getAll().subscribe({
      next: (claim) => {
        this.claims = claim;
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => (this.isLoading = false));
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
}
