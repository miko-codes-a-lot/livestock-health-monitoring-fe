import { Routes } from '@angular/router';
import { Login } from './login/login';
import { authGuard } from './_shared/guard/auth-guard';

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
    canActivate: [authGuard],
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    canActivate: [authGuard],
    path: 'user',
    loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES),
  },
  {
    canActivate: [authGuard],
    path: 'livestock',
    loadChildren: () => import('./livestock/livestock.routes').then(m => m.LIVESTOCK_ROUTES),
  },
  {
    canActivate: [authGuard],
    path: 'health-record',
    loadChildren: () => import('./health-record/health-record.routes').then(m => m.HEALTH_RECORD_ROUTES),
  },
  {
    canActivate: [authGuard],
    path: 'treatment',
    loadChildren: () => import('./treatment/treatment.routes').then(m => m.TREATMENT_ROUTES),
  },
  {
    canActivate: [authGuard],
    path: 'vaccination',
    loadChildren: () => import('./vaccination/vaccination.routes').then(m => m.VACCINATION_ROUTES),
  },
  {
    canActivate: [authGuard],
    path: 'schedule',
    loadChildren: () => import('./schedule/schedule.routes').then(m => m.SCHEDULE_ROUTES),
  },
];
