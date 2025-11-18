import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDto } from '../../_shared/model/user-dto';
import { AuthService } from '../../_shared/service/auth-service';
import { Schedule } from '../../_shared/model/schedule';
import { ScheduleService } from '../../_shared/service/schedule-service';
import { UserService } from '../../_shared/service/user-service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-schedule-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './schedule-details.html',
  styleUrl: './schedule-details.css'
})
export class ScheduleDetails implements OnInit  {
  isLoading = false;
  livestock?: Schedule;
  schedule?: Schedule;
  farmerName = '';
  livestockGroupName = '';
  healthRecordDetails = '';
  user: UserDto | null = null;
  vetName = '';
  requestedBy = '';
  animal = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly scheduleService: ScheduleService,
    private readonly healthRecordService: HealthRecordService,
    private readonly userService: UserService,

  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];

    this.authService.currentUser$.subscribe({
      next: (u) => {
        if (u) {
          this.user = u
        }
      }
    })

    this.scheduleService.getOne(id).subscribe({
      next: (schedule) => {
        this.schedule = schedule;
        if (schedule.healthRecord) {
          this.healthRecordService.getOne(schedule.healthRecord).subscribe(hr => {
            this.healthRecordDetails = `Tag Number: ${hr.animal.tagNumber} | Body Condition: ${hr.bodyCondition} | Weight(Kg): ${hr.weightKg}`;
            this.animal = hr.animal.tagNumber;
          });
        }

        if (schedule.assignedVet) {
          this.userService.getOne(schedule.assignedVet).subscribe(f => {
            this.vetName = `${f.firstName} ${f.lastName}`;
          });
        }

        if (schedule.createdBy) {
          this.userService.getOne(schedule.createdBy).subscribe(f => {
            this.requestedBy = `${f.firstName} ${f.lastName}`;
          });
        }
      },
      error: (err) => alert(`Something went wrong: ${err}`),
    }).add(() => (this.isLoading = false));
  }


  onUpdate() {
    if (!this.schedule) return;
    this.router.navigate(['/schedule/update', this.schedule._id]);
  }

  
  onReject() {
    if (this.schedule?._id) {
      this.processStatus(this.schedule._id, 'declined')
    }
  }

    
  onApprove() {
    if (this.schedule?._id) {
      this.processStatus(this.schedule._id, 'approved')
    }
  }

  onComplete() {
    if (this.schedule?._id) {
      this.processStatus(this.schedule._id, 'completed')
    }
  }

  processStatus(scheduleId: string, statusValue: string, customMessage?: string) {
    this.scheduleService.updateStatus(scheduleId, {status: statusValue})
      .subscribe({
        next: (res) => {
          if(customMessage) {
            alert(customMessage)
          } else {
            alert(`Schedule Successfully ${statusValue}`)
          }
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/schedule/details', this.schedule!._id]);
          });
        },
        error: (err) => {
          console.error('Error updating status:', err);
        }
      });
  }

  actionNotPermitted() {
     return this.schedule?.status && ['approved', 'declined', 'completed'].includes(this.schedule.status)
  }

}
