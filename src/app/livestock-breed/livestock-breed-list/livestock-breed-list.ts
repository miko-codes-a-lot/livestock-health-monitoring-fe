import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { LivestockBreed } from '../../_shared/model/livestock-breed';
import { LivestockBreedService } from '../../_shared/service/livestock-breed-service';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';

@Component({
  selector: 'app-livestock-breed-list',
  standalone: true,
  imports: [CommonModule, GenericTableComponent],
  templateUrl: './livestock-breed-list.html',
  styleUrls: ['./livestock-breed-list.css'],
})
export class LivestockBreedList implements OnInit {
  isLoading = false;
  dataSource = new MatTableDataSource<LivestockBreed>();

  displayedColumns = ['name', 'classification', 'actions'];
  columnDefs = [
    { key: 'name', label: 'Name' },
    { 
      key: 'classification', 
      label: 'Classification', 
      cell: (e: LivestockBreed) => {
        if (typeof e.classification === 'string') {
          return e.classification; // string case
        } else if (e.classification && 'name' in e.classification) {
          return e.classification.name; // object case
        } else {
          return 'N/A'; // fallback
        }
      }
    }
  ];

  constructor(
    private readonly livestockBreedService: LivestockBreedService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.livestockBreedService.getAll().subscribe({
      next: (breeds) => {
        this.dataSource.data = breeds;

          // Sorting for nested classification
          this.dataSource.sortingDataAccessor = (item, property) => {
            if (property === 'classification') {
              if (typeof item.classification === 'string') {
                return item.classification.toLowerCase();
              } else if (item.classification && 'name' in item.classification) {
                return item.classification.name.toLowerCase();
              } else {
                return '';
              }
            }
            const value = (item as any)[property];
            return typeof value === 'string' ? value.toLowerCase() : value;
          };

          // Filtering: name + classification
          this.dataSource.filterPredicate = (item, filter: string) => {
            const f = filter.toLowerCase();
            
            const nameMatch = item.name?.toLowerCase().includes(f) ?? false;

            let classValue = '';
            if (typeof item.classification === 'string') {
              classValue = item.classification.toLowerCase();
            } else if (item.classification && 'name' in item.classification) {
              classValue = item.classification.name.toLowerCase();
            }

            return nameMatch || classValue.includes(f);
          };

        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
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
