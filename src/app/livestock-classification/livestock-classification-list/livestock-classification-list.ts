import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { LivestockClassification } from '../../_shared/model/livestock-classification';
import { LivestockClassificationService } from '../../_shared/service/livestock-classification-service';
import { GenericTableComponent } from '../../_shared/component/table/generic-table.component';

@Component({
  selector: 'app-livestock-classification-list',
  standalone: true,
  imports: [CommonModule, GenericTableComponent],
  templateUrl: './livestock-classification-list.html',
  styleUrls: ['./livestock-classification-list.css']
})
export class LivestockClassificationList implements OnInit {
  isLoading = false;
  dataSource = new MatTableDataSource<LivestockClassification>();

  displayedColumns = ['name', 'description', 'icon', 'actions'];
  columnDefs = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'icon', label: 'Icon', cell: (e: LivestockClassification) => e.icon }
  ];

  constructor(
    private readonly livestockClassificationService: LivestockClassificationService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.livestockClassificationService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;

        // Sorting for string columns
        this.dataSource.sortingDataAccessor = (item, property) => {
          const value = (item as any)[property];
          return typeof value === 'string' ? value.toLowerCase() : value;
        };

        // Filtering: name + description + icon
        this.dataSource.filterPredicate = (item, filter: string) => {
          const searchStr = `${item.name}${item.description}${item.icon}`.toLowerCase();
          return searchStr.includes(filter);
        };

        this.isLoading = false;
      },
      error: (err) => {
        alert(`Something went wrong: ${err}`);
        this.isLoading = false;
      }
    });
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
