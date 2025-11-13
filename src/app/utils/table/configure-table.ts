import { MatTableDataSource } from '@angular/material/table';

/**
 * Safely retrieves a nested value from an object using dot notation (e.g. 'farmer.address.barangay')
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Configures sorting and filtering for MatTableDataSource with support for nested fields.
 * 
 * @param dataSource - The MatTableDataSource instance
 * @param accessorPaths - List of nested property paths to include in sorting/filtering
 */
export function configureTable<T>(
  dataSource: MatTableDataSource<T>,
  accessorPaths: string[] = []
): void {
  // Sorting logic
  dataSource.sortingDataAccessor = (item: any, property: string) => {
    if (accessorPaths.includes(property)) {
      const value = getNestedValue(item, property);
      return typeof value === 'string' ? value.toLowerCase() : value || '';
    }
    return (item as any)[property];
  };

  // Filtering logic
  dataSource.filterPredicate = (data: any, filter: string) => {
    const combined =
      (data.groupName || '') +
      accessorPaths.map(path => getNestedValue(data, path) || '').join('') +
      (data.status || '');
    return combined.toLowerCase().includes(filter.trim().toLowerCase());
  };
}
