import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HealthRecord } from '../../_shared/model/health-record';
import { HealthRecordService } from '../../_shared/service/health-record-service';

@Component({
  selector: 'app-health-record-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './health-record-list.html',
  styleUrl: './health-record-list.css'
})
export class HealthRecordList {
healthRecords: HealthRecord[] = [];
  isLoading = false;

  displayedColumns = [
    'animal',            // reference to the livestock
    'visitDate',
    'bodyCondition',
    'weightKg',
    'diagnosis',
    'treatmentGiven',
    'technician',
    'action'             // for buttons like edit/view
  ];

  constructor(
    private readonly healthRecordService: HealthRecordService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.healthRecordService.getAll().subscribe({
      next: (healthRecord) => {
        this.healthRecords = healthRecord;
        console.log('this.healthRecord dawdw', healthRecord); // ✅ real data is here
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => (this.isLoading = false));
  }

  onCreate() {
    this.router.navigate(['/healthRecord/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/healthRecord/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/healthRecord/update', id]);
  }
}
