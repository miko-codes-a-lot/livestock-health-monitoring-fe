import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { Schedule } from '../../_shared/model/schedule';
import { ScheduleService } from '../../_shared/service/schedule-service';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';
import { configureTable } from '../../utils/table/configure-table';
import { AuthService } from '../../_shared/service/auth-service';
import { UserDto } from '../../_shared/model/user-dto';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, GenericTableComponent, MatIconModule, MatButtonModule],
  templateUrl: './schedule-list.html',
  styleUrl: './schedule-list.css'
})
export class ScheduleList implements OnInit {
  isLoading = false;
  dataSource = new MatTableDataSource<Schedule>();
  user: UserDto | null = null;

  displayedColumns = ['animal.tagNumber', 'healthRecord.bodyCondition', 'assignedVet.firstName', 'scheduledDate', 'type', 'status', 'actions'];
  columnDefs = [
    { 
      key:'animal.tagNumber',
      label: 'Animal',
      cell: (element: any) => element.animal.tagNumber || '—'
    },
    { key: 'healthRecord.bodyCondition',
      label: 'Health Record', // Tag Number: 001 | Body Condition: ideal | Weight(Kg): 210
      cell: (element: any) => `Tag Number: ${element.animal.tagNumber} | Body Condition: ${element.healthRecord.bodyCondition} | Weight(Kg): ${element.healthRecord.weightKg}` || '—'
    },
    {
      key: 'assignedVet.firstName',
      label: 'Assigned Vet',
      cell: (element: any) => `${element.assignedVet.firstName} ${element.assignedVet.lastName}` || '—'
    },
    { key: 'scheduledDate', label: 'Scheduled Date', cell: (element: any) => new Date(element.scheduledDate).toLocaleString() || '-' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
  ];

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.authService.currentUser$.subscribe( u => this.user = u)

    this.scheduleService.getAll().subscribe({
      next: (schedules) => {
        console.log('schedules', schedules)
        if(this.user?.role === 'vet') {
          this.dataSource.data = schedules.filter((s) => 
            this.isUserDto(s.assignedVet) && s.assignedVet._id === this.user?._id
          );
        }else if(this.user?.role === 'technician') {
          this.dataSource.data = schedules.filter((s) => s.createdBy === this.user?._id);
        }else if(this.user?.role === 'farmer') {
          this.dataSource.data = schedules.filter((s: any) => s.animal.farmer === this.user?._id);
        } else {
          // if admin display all
          this.dataSource.data = schedules
        }

        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  isUserDto(vet: string | UserDto): vet is UserDto {
    return typeof vet !== 'string' && '_id' in vet;
  }

  ngAfterViewInit() {
    // sorting & filtering for nested fields
    configureTable(this.dataSource, ['animal.tagNumber', 'healthRecord.bodyCondition', 'assignedVet.firstName', 'assignedVet.lastName', 'type'])
  }

  onCreate() {
    this.router.navigate(['/schedule/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/schedule/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/schedule/update', id]);
  }
  
  get canCreate(): boolean {
    return !!this.user && ['technician'].includes(this.user.role);
  }

}
