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

  constructor(
    private readonly healthRecordService: HealthRecordService,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

    ngOnInit(): void {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];

    this.healthRecordService.getOne(id).subscribe({
      next: (healthRecord) => {
        this.healthRecord = healthRecord;
        console.log('healthRecord', healthRecord)
        // Fetch farmer name
        if (healthRecord.technician?._id) {
          this.userService.getOne(healthRecord.technician._id).subscribe(f => {
            this.technicianName = `${f.firstName} ${f.lastName}`;
          });
        }

      },
      error: (err) => alert(`Something went wrong: ${err}`),
    }).add(() => (this.isLoading = false));
  }

  onUpdate() {
    if (!this.healthRecord) return;
    this.router.navigate(['/health-record/update', this.healthRecord._id]);
  }
  
}
