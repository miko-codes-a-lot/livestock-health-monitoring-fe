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
        // Fetch farmer name

        if (healthRecord.technician?._id) {

          this.scheduleService.getAll()
            .subscribe((schedules: any[]) => {
              // Check if there is any schedule with 'pending' or 'declined' for this health record
              this.isUpdateDisabled = schedules
                .some(s => (s.healthRecord._id === healthRecord._id && ['pending', 'declined'].includes(s.status)) || this.user?.role === 'farmer');

              this.healthRecord = healthRecord;
            })
            .add(() => this.isLoading = false);

        
          this.userService.getOne(healthRecord.technician._id).subscribe(f => {
            this.technicianName = `${f.firstName} ${f.lastName}`;
          });

        }
      },
      error: (err) => alert(`Something went wrong: ${err}`),
    });
  }

  onUpdate() {
    if (!this.healthRecord) return;
    this.router.navigate(['/health-record/update', this.healthRecord._id]);
  }
  
}
