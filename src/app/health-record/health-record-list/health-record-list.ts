import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';

import { HealthRecord } from '../../_shared/model/health-record';
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';
import { ScheduleService } from '../../_shared/service/schedule-service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


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
    GenericTableComponent,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './health-record-list.html',
  styleUrls: ['./health-record-list.css']
})
export class HealthRecordList implements OnInit {
  dataSource = new MatTableDataSource<HealthRecord>();
  isLoading = false;
  user: UserDto | null = null;

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
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly scheduleService: ScheduleService,
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.authService.currentUser$.subscribe({
      next: (u) => this.user = u ?? null
    });

    this.healthRecordService.getAll().subscribe({
      next: (records) => {
        this.scheduleService.getAll().subscribe({
          next: (schedules) => {
            // Create a map for fast lookups
            const scheduleMap = new Map(
               schedules.map((s: any) => [s.healthRecord._id, s])   // or whatever key matches
            );
            let recordsData = records
            // console.log('records', records.animal.farmer)
            if(this.user?.role === 'farmer') {
              recordsData = records.filter((r) => r.animal?.farmer === this.user?._id )
            }
            // Add new property to each record
            this.dataSource.data = recordsData.map(r => {
              if (r._id) {
                const match = scheduleMap.get(r._id);  // match using your ID
                return {
                  ...r,
                  scheduleStatus: match ? match.status : null,
                  scheduleId: match ? match._id : null
                };
              }

              return r
            });

            
          }
        }).add(() => (this.isLoading = false))
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    });
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

  get canCreate(): boolean {
    return !!this.user && ['technician','admin'].includes(this.user.role);
  }
}
