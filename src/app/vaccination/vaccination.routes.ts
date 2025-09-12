import { Routes } from "@angular/router";
import { Vaccination } from "./vaccination";

export const VACCINATION_ROUTES: Routes = [
  {
    path: '',
    component: Vaccination,
    children: [
      {
        path: '',
        redirectTo: '/vaccination/list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./vaccination-list/vaccination-list').then(m => m.VaccinationList),
      },
      {
        path: 'create',
        loadChildren: () => import('./vaccination-create/vaccination-create').then(m => m.VaccinationCreate),
      },
      {
        path: 'update',
        loadChildren: () => import('./vaccination-update/vaccination-update').then(m => m.VaccinationUpdate),
      },
      {
        path: 'details',
        loadChildren: () => import('./vaccination-details/vaccination-details').then(m => m.VaccinationDetails),
      },
    ]
  }
]