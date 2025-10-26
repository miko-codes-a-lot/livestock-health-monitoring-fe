import { Routes } from "@angular/router";
import { Dashboard } from "./dashboard";

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      {
        path: 'admin',
        loadComponent: () => import('./dashboard-admin/dashboard-admin').then(m => m.DashboardAdmin),
      },
      {
        path: 'farmer',
        loadComponent: () => import('./dashboard-farmer/dashboard-farmer').then(m => m.DashboardFarmer),
      },
      {
        path: 'technician',
        loadComponent: () => import('./dashboard-veterinarian/dashboard-veterinarian').then(m => m.DashboardVeterinarian),
      },
    ]
  }
]