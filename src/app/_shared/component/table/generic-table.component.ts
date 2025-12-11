import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, inject, ContentChild, TemplateRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css']
})
export class GenericTableComponent<T> implements OnInit, AfterViewInit, OnChanges {

  @Input() title = '';
  @Input() createButtonLabel = '';
  @Input() createButtonLink = '';
  @Input() displayedColumns: string[] = [];
  @Input() columnDefs: { key: string; label: string; cell?: (el: T) => any }[] = [];
  @Input() data: T[] = [];
  @Input() isLoading = false;
  @Input() canCreate: boolean | (() => boolean) = true;

  @Output() details = new EventEmitter<any>();
  @Output() update = new EventEmitter<any>();
  @Output() create = new EventEmitter<any>();
  @Output() markAsRead = new EventEmitter<any>();

  dataSource = new MatTableDataSource<T>();   // <-- FIX: No Input()
  mobilePagedData: T[] = [];

  isMobile = window.innerWidth < 768;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ContentChild('actions', { read: TemplateRef }) actionsTemplate?: TemplateRef<any>;
  private live = inject(LiveAnnouncer);

  ngOnInit() {
    this.setupDisplayedColumns();
    this.updateDataSource();

    window.addEventListener("resize", () => {
      this.isMobile = window.innerWidth < 768;
      this.updateMobilePagedData();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.updateDataSource();
      this.updateMobilePagedData();

      if (this.paginator) this.paginator.firstPage();
    }
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.paginator.page.subscribe(() => this.updateMobilePagedData());
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;

      this.dataSource.sortingDataAccessor = (item: any, property: string) => {
        const value = this.getNestedValue(item, property);

        if (value === null || value === undefined) return '';

        if (typeof value === 'string') return value.toLowerCase();

        if (typeof value === 'number') return value;

        return JSON.stringify(value).toLowerCase();
      };

    }

    this.updateMobilePagedData();
    this.dataSource.connect().subscribe(() => this.updateMobilePagedData());
  }

  private getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  private updateDataSource() {
    this.dataSource.data = this.data || [];
    this.dataSource.filterPredicate = (data: any, filter: string) =>
      JSON.stringify(data).toLowerCase().includes(filter);

    // re-attach paginator + sort AFTER data changes
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;

    this.dataSource.data.forEach(r => (r as any).expanded = false);
  }

  private setupDisplayedColumns() {
    if (this.columnDefs.length > 0) {
      this.displayedColumns = this.columnDefs.map(c => c.key).concat('actions');
    }
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = value;

    this.paginator.firstPage();
    this.updateMobilePagedData();
  }

  private updateMobilePagedData() {
    if (!this.isMobile || !this.paginator) return;

    const data = this.dataSource.filteredData;
    const pageIndex = this.paginator.pageIndex ?? 0;
    const pageSize = this.paginator.pageSize ?? 5;

    this.mobilePagedData = data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.live.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this.live.announce("Sorting cleared");
    }
  }

  onDetailsClick(el: any) { this.details.emit(el._id); }
  onUpdateClick(el: any) { this.update.emit(el._id); }
  onCreateClick() { this.create.emit(); }
  onMarkAsReadClick(el: any) { this.markAsRead.emit(el._id); }

  getCellValue(col: any, el: any) {
    if (col.cell) return col.cell(el);

    const value = this.getNestedValue(el, col.key);
    return value ?? '';
  }

  isCreateDisabled(): boolean {
    return typeof this.canCreate === "function" ? !this.canCreate() : !this.canCreate;
  }
}

