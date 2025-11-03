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
    // data: { role: 'admin' },
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    canActivate: [AuthGuard],
    path: 'user',
    // data: { role: 'admin' },
    loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'user-settings',
    // data: { role: 'admin' },
    loadChildren: () => import('./user-settings/user-settings.routes').then(m => m.USER_SETTINGS_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'livestock',
    // data: { role: 'admin' },
    loadChildren: () => import('./livestock/livestock.routes').then(m => m.LIVESTOCK_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'livestock-classification',
    // data: { role: 'admin' },
    loadChildren: () => import('./livestock-classification/livestock-classification.routes').then(m => m.LIVESTOCK_CLASSIFICATION_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'livestock-breed',
    // data: { role: 'admin' },
    loadChildren: () => import('./livestock-breed/livestock-breed.routes').then(m => m.LIVESTOCK_BREED_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'health-record',
    // data: { role: 'admin' },
    loadChildren: () => import('./health-record/health-record.routes').then(m => m.HEALTH_RECORD_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'claims',
    // data: { role: 'admin' },
    loadChildren: () => import('./claims/claims.routes').then(m => m.CLAIMS_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'livestock-group',
    // data: { role: 'admin' },
    loadChildren: () => import('./livestock-group/livestock-group.routes').then(m => m.LIVESTOCK_GROUP_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'insurance-policy',
    // data: { role: 'admin' },
    loadChildren: () => import('./insurance-policy/insurance-policy.routes').then(m => m.INSURANCE_POLICY_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'treatment',
    // data: { role: 'admin' },
    loadChildren: () => import('./treatment/treatment.routes').then(m => m.TREATMENT_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'vaccination',
    // data: { role: 'admin' },
    loadChildren: () => import('./vaccination/vaccination.routes').then(m => m.VACCINATION_ROUTES),
  },
  {
    canActivate: [AuthGuard],
    path: 'schedule',
    // data: { role: 'admin' },
    loadChildren: () => import('./schedule/schedule.routes').then(m => m.SCHEDULE_ROUTES),
  },
];
