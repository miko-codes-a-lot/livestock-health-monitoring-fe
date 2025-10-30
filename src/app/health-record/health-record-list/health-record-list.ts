import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';

import { HealthRecord } from '../../_shared/model/health-record';
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';

interface ColumnDef<T> {
  key: string;
  label: string;
  cell?: (element: T) => any;
}

@Component({
  selector: 'app-health-record-list',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    GenericTableComponent
  ],
  templateUrl: './health-record-list.html',
  styleUrls: ['./health-record-list.css']
})
export class HealthRecordList implements OnInit {
  dataSource = new MatTableDataSource<HealthRecord>();
  isLoading = false;

  columnDefs: ColumnDef<HealthRecord>[] = [
    { key: 'animal', label: 'Animal', cell: r => r.animal?.tagNumber || 'N/A' },
    { key: 'visitDate', label: 'Visit Date', cell: r => new Date(r.visitDate).toLocaleString() },
    { key: 'bodyCondition', label: 'Body Condition' },
    { key: 'weightKg', label: 'Weight (kg)' },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'treatmentGiven', label: 'Treatment' },
    { key: 'technician', label: 'Technician', cell: r => `${r.technician.firstName} ${r.technician.lastName}` },
  ];

  // DO NOT include 'actions' here; GenericTableComponent handles it automatically
  displayedColumnsKeys = [...this.columnDefs.map(c => c.key), 'actions'];

  constructor(
    private readonly healthRecordService: HealthRecordService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.healthRecordService.getAll().subscribe({
      next: (records) => this.dataSource.data = records,
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => (this.isLoading = false));
  }

  onCreate() {
    this.router.navigate(['/health-record/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/health-record/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/health-record/update', id]);
  }
}
