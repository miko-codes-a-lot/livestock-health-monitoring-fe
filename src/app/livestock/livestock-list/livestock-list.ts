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
  selector: 'app-livestock-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './livestock-list.html',
  styleUrls: ['./livestock-list.css']
})
export class LivestockList {
  livestocks: Livestock[] = [];
  isLoading = false;

  displayedColumns = [
    'tagNumber',
    'species',
    'breed',
    'sex',
    'age',
    'status',
    'action'
  ];

  constructor(
    private readonly livestockService: LivestockService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.livestockService.getAll().subscribe({
      next: (livestock) => {
        this.livestocks = livestock;
        console.log('this.livestocks dawdw', livestock); // ✅ real data is here
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => (this.isLoading = false));
  }

  onCreate() {
    this.router.navigate(['/livestock/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/livestock/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/livestock/update', id]);
  }
}
