import { Routes } from "@angular/router";
import { Treatment } from "./treatment";

export const TREATMENT_ROUTES: Routes = [
  {
    path: '',
    component: Treatment,
    children: [
      {
        path: '',
        redirectTo: '/treatment/list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./treatment-list/treatment-list').then(m => m.TreatmentList),
      },
      {
        path: 'create',
        loadChildren: () => import('./treatment-create/treatment-create').then(m => m.TreatmentCreate),
      },
      {
        path: 'update',
        loadChildren: () => import('./treatment-update/treatment-update').then(m => m.TreatmentUpdate),
      },
      {
        path: 'details',
        loadChildren: () => import('./treatment-details/treatment-details').then(m => m.TreatmentDetails),
      },
    ]
  }
]