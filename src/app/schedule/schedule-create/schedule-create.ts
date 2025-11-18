import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleForm } from '../schedule-form/schedule-form';
import { ScheduleService } from '../../_shared/service/schedule-service';
import { Schedule } from '../../_shared/model/schedule';
import { Router } from '@angular/router';

@Component({
  selector: 'app-schedule-create',
  standalone: true,
  imports: [CommonModule, ScheduleForm],
  templateUrl: './schedule-create.html',
  styleUrls: ['./schedule-create.css'],
})
export class ScheduleCreate {
  isLoading = false;
  initDoc!: Schedule;

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.initDoc = this.scheduleService.getEmptyOrNullDoc();
  }

  onSubmit(payload: { scheduleData: Schedule }) {
    const { scheduleData } = payload;
    this.isLoading = true;

    this.scheduleService.create(scheduleData).subscribe({
      next: (data) => {
        const scheduleId = data._id;
        this.router.navigate(['/schedule/details', scheduleId], { replaceUrl: true });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Schedule creation failed', err);
      },
    });
  }
}
