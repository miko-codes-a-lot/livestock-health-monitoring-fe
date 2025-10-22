import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LivestockClassification } from '../../_shared/model/livestock-classification';
import { LivestockClassificationService } from '../../_shared/service/livestock-classification-service';


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
  templateUrl: './livestock-classification-list.html',
  styleUrls: ['./livestock-classification-list.css']
})
export class LivestockClassificationList {
  livestockClassifications: LivestockClassification[] = [];
  isLoading = false;

  displayedColumns = [
    'name',
    'description',
    'icon',
    'action'
  ];

  constructor(
    private readonly livestockClassificationService: LivestockClassificationService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.livestockClassificationService.getAll().subscribe({
      next: (livestockClassification) => {
        this.livestockClassifications = livestockClassification;
        console.log('this.livestockClassification', livestockClassification); // ✅ real data is here
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => (this.isLoading = false));
  }

  onCreate() {
    this.router.navigate(['/livestock-classification/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/livestock-classification/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/livestock-classification/update', id]);
  }
}
