import { Component } from '@angular/core';
import { HealthRecordForm } from '../health-record-form/health-record-form';
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Needed for *ngIf, etc.

@Component({
  selector: 'app-health-record-create',
  standalone: true,            // <-- Make it standalone
  imports: [
    CommonModule,
    HealthRecordForm            // <-- Include your form here
  ],
  templateUrl: './health-record-create.html',
  styleUrls: ['./health-record-create.css']
})
export class HealthRecordCreate {
  isLoading = false;
  initDoc: any; // HealthRecord type

  constructor(
    private readonly healthRecordService: HealthRecordService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.initDoc = this.healthRecordService.getEmptyOrNullDoc();
  }

  onSubmit(healthRecord: any) {
    this.healthRecordService.create(healthRecord).subscribe({
      next: data => this.router.navigate(['/health-record/details', data._id], { replaceUrl: true }),
      error: err => console.log(`Something went wrong: ${err}`)
    })
  }
}
