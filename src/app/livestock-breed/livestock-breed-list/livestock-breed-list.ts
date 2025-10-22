import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LivestockBreed } from '../../_shared/model/livestock-breed';
import { LivestockBreedService } from '../../_shared/service/livestock-breed-service';


@Component({
  selector: 'app-livestock-breed-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './livestock-breed-list.html',
  styleUrls: ['./livestock-breed-list.css']
})
export class LivestockBreedList {
  livestockBreeds: LivestockBreed[] = [];
  isLoading = false;

  displayedColumns = [
    'name',
    'classification',
    'action'
  ];

  constructor(
    private readonly livestockBreedService: LivestockBreedService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.livestockBreedService.getAll().subscribe({
      next: (livestockBreed) => {
        this.livestockBreeds = livestockBreed;
        console.log('this.livestockBreed ', livestockBreed); // ✅ real data is here
      },
      error: (err) => alert(`Something went wrong: ${err}`)
    }).add(() => (this.isLoading = false));
  }

  onCreate() {
    this.router.navigate(['/livestock-breed/create']);
  }

  onDetails(id: string) {
    this.router.navigate(['/livestock-breed/details', id]);
  }

  onUpdate(id: string) {
    this.router.navigate(['/livestock-breed/update', id]);
  }
}
