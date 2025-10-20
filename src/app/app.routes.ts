import { Routes } from '@angular/router';
import { Login } from './login/login';
import { AuthGuard } from './_shared/guard/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    canActivate: [AuthGuard],
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    canActivate: [AuthGuard],
    path: 'user',
    loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'livestock',
    loadChildren: () => import('./livestock/livestock.routes').then(m => m.LIVESTOCK_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'health-record',
    loadChildren: () => import('./health-record/health-record.routes').then(m => m.HEALTH_RECORD_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'treatment',
    loadChildren: () => import('./treatment/treatment.routes').then(m => m.TREATMENT_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'vaccination',
    loadChildren: () => import('./vaccination/vaccination.routes').then(m => m.VACCINATION_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'schedule',
    loadChildren: () => import('./schedule/schedule.routes').then(m => m.SCHEDULE_ROUTES),
  },
];
