import { Component, OnInit } from '@angular/core';
import { ScheduleForm } from '../schedule-form/schedule-form';
import { ScheduleService } from '../../_shared/service/schedule-service';
import { HealthRecord } from '../../_shared/model/health-record';
import { Schedule } from '../../_shared/model/schedule';
import { HealthRecordService } from '../../_shared/service/health-record-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-schedule-update',
  imports: [ScheduleForm],
  templateUrl: './schedule-update.html',
  styleUrl: './schedule-update.css'
})
export class ScheduleUpdate implements OnInit {
  isLoading = false;
  id!: string;
  initDoc!: Schedule;

  constructor(
    private readonly healthRecordService: HealthRecordService,
    private readonly scheduleService: ScheduleService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.initDoc = this.scheduleService.getEmptyOrNullDoc();
    this.id = this.route.snapshot.params['id'];

    this.scheduleService.getOne(this.id).subscribe({
      next: (doc) => {
        console.log('doc', doc)
        this.initDoc = doc;
        // patch form after fetch
      },
      error: (e) => alert(`Something went wrong: ${e}`)
    }).add(() => this.isLoading = false);
  }

  onSubmit(payload: { scheduleData: Schedule }) {
    this.isLoading = true;
    const { scheduleData } = payload;  // extract Schedule
    this.scheduleService.update(this.id, scheduleData).subscribe({
      next: () => {
        alert('Schedule updated successfully!');
        this.router.navigate(['/schedule/list']);
      },
      error: (e) => alert(`Update failed: ${e}`)
    }).add(() => this.isLoading = false);
  }

}
