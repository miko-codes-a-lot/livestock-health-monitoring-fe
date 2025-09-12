import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES),
  },
  {
    path: 'livestock',
    loadChildren: () => import('./livestock/livestock.routes').then(m => m.LIVESTOCK_ROUTES),
  },
  {
    path: 'health-record',
    loadChildren: () => import('./health-record/health-record.routes').then(m => m.HEALTH_RECORD_ROUTES),
  },
  {
    path: 'treatment',
    loadChildren: () => import('./treatment/treatment.routes').then(m => m.TREATMENT_ROUTES),
  },
  {
    path: 'vaccination',
    loadChildren: () => import('./vaccination/vaccination.routes').then(m => m.VACCINATION_ROUTES),
  },
  {
    path: 'schedule',
    loadChildren: () => import('./schedule/schedule.routes').then(m => m.SCHEDULE_ROUTES),
  },
];
