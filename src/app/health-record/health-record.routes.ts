import { Routes } from "@angular/router";
import { HealthRecord } from "./health-record";

export const HEALTH_RECORD_ROUTES: Routes = [
  {
    path: '',
    component: HealthRecord,
    children: [
      {
        path: '',
        redirectTo: '/health-record/list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./health-record-list/health-record-list').then(m => m.HealthRecordList),
      },
      {
        path: 'create',
        loadChildren: () => import('./health-record-create/health-record-create').then(m => m.HealthRecordCreate),
      },
      {
        path: 'update',
        loadChildren: () => import('./health-record-update/health-record-update').then(m => m.HealthRecordUpdate),
      },
      {
        path: 'details',
        loadChildren: () => import('./health-record-details/health-record-details').then(m => m.HealthRecordDetails),
      },
    ]
  }
]