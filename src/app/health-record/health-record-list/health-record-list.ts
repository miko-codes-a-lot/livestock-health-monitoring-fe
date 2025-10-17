import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Livestock } from '../../_shared/model/livestock';
import { LivestockService } from '../../_shared/service/livestock-service';

@Component({
  selector: 'app-health-record-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './health-record-list.html',
  styleUrl: './health-record-list.css'
})
export class HealthRecordList {

}
