import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { HealthRecord } from '../../_shared/model/health-record';
import { UserService } from '../../_shared/service/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from '../../_shared/service/schedule-service';
import { AuthService } from '../../_shared/service/auth-service';
import { UserDto } from '../../_shared/model/user-dto';
import { Schedule } from '../../_shared/model/schedule';

@Component({
  selector: 'app-health-record-details',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './health-record-details.html',
  styleUrl: './health-record-details.css'
})
export class HealthRecordDetails implements OnInit {
  isLoading = false;
  healthRecord?: HealthRecord;
  technicianName = '';
  isUpdateDisabled = false;
  user: UserDto | null = null;
  nextVaccinationDate?: string;
  schedules: Schedule[] = [];
  expandedIndex: number | null = null;

  constructor(
    private readonly healthRecordService: HealthRecordService,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly scheduleService: ScheduleService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    const id = this.route.snapshot.params['id'];
    this.authService.currentUser$.subscribe({
      next: (u) => this.user = u ?? null
    });

    this.healthRecordService.getOne(id).subscribe({
      next: (healthRecord) => {
        this.healthRecord = healthRecord; // set healthRecord first
        if (healthRecord.technician?._id) {
          // Fetch technician name
          this.userService.getOne(healthRecord.technician._id).subscribe(f => {
            this.technicianName = `${f.firstName} ${f.lastName}`;
          });

          // Fetch all schedules
          this.scheduleService.getAll().subscribe((schedules: any[]) => {
             this.schedules = schedules
              .filter(s => s.healthRecord._id === this.healthRecord?._id);
            // 1️⃣ Determine if update button should be disabled
            this.isUpdateDisabled = schedules
              .some(s => (s.healthRecord._id === healthRecord._id && ['pending', 'declined', 'completed'].includes(s.status)) 
                        || this.user?.role === 'farmer');

            // 2️⃣ Compute next vaccination date
            const nextVaccination = schedules
              .filter(s => 
                s.healthRecord._id === healthRecord._id
                && s.type === 'vaccination' &&
                s.status === 'approved'
                && new Date(s.scheduledDate) >= new Date() // only future dates
              )
              .sort((a, b) => new Date(a.scheduledDate.$date).getTime() - new Date(b.scheduledDate.$date).getTime());

            this.nextVaccinationDate = nextVaccination.length > 0
              ? nextVaccination[0].scheduledDate
              : undefined;


          }).add(() => this.isLoading = false);
        } else {
          // No technician assigned
          this.isLoading = false;
        }
      },
      error: (err) => {
        alert(`Something went wrong: ${err}`);
        this.isLoading = false;
      }
    });
  }

  onUpdate() {
    if (!this.healthRecord) return;
    this.router.navigate(['/health-record/update', this.healthRecord._id]);
  }

  getVetName(schedule: any): string {
    if (!schedule.assignedVet || typeof schedule.assignedVet === 'string') {
      return '—';
    }
    return `${schedule.assignedVet.firstName} ${schedule.assignedVet.lastName}`;
  }

  getTreatment(schedule: any): string {
    if (!schedule.treatment || typeof schedule.treatment === 'string') {
      return '—';
    }
    return `${schedule.treatment}`;
  }

  toggleHistory(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
  
}
