import { Component, OnInit } from '@angular/core';
import { HealthRecordForm } from '../health-record-form/health-record-form';
import { HealthRecord } from '../../_shared/model/health-record';
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-health-record-update',
  imports: [HealthRecordForm],
  templateUrl: './health-record-update.html',
  styleUrl: './health-record-update.css'
})
export class HealthRecordUpdate implements OnInit {
  isLoading = false;
  id!: string;
  initDoc!: HealthRecord;


  constructor(
    private readonly healthRecordService: HealthRecordService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.initDoc = this.healthRecordService.getEmptyOrNullDoc();
    this.id = this.route.snapshot.params['id'];

    this.healthRecordService.getOne(this.id).subscribe({
      next: (doc) => {
        console.log('doc', doc)
        this.initDoc = doc;
        // patch form after fetch
      },
      error: (e) => alert(`Something went wrong: ${e}`)
    }).add(() => this.isLoading = false);
  }

  onSubmit(updatedHealthRecord: HealthRecord) {
    this.isLoading = true;
    this.healthRecordService.update(this.id, updatedHealthRecord).subscribe({
      next: () => {
        alert('Health Record updated successfully!');
        this.router.navigate(['/health-record/list']);
      },
      error: (e) => alert(`Update failed: ${e}`)
    }).add(() => this.isLoading = false);
  }

}
