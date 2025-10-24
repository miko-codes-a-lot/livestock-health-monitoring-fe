import { Routes } from "@angular/router";
import { Claims } from "./claims";

export const CLAIMS_ROUTES: Routes = [
  {
    path: '',
    component: Claims,
    children: [
      {
        path: '',
        redirectTo: '/claims/list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./claims-list/claims-list').then(m => m.ClaimsList),
      },
      {
        path: 'create',
        loadComponent: () => import('./claims-create/claims-create').then(m => m.ClaimsCreate),
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./claims-update/claims-update').then(m => m.ClaimsUpdate),
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./claims-details/claims-details').then(m => m.ClaimsDetails),
      },
    ]
  }
]