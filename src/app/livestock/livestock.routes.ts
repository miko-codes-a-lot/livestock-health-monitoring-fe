import { Routes } from "@angular/router";
import { Livestock } from "./livestock";

export const LIVESTOCK_ROUTES: Routes = [
  {
    path: '',
    component: Livestock,
    children: [
      {
        path: '',
        redirectTo: '/livestock/list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./livestock-list/livestock-list').then(m => m.LivestockList),
      },
      {
        path: 'create',
        loadComponent: () => import('./livestock-create/livestock-create').then(m => m.LivestockCreate),
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./livestock-update/livestock-update').then(m => m.LivestockUpdate),
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./livestock-details/livestock-details').then(m => m.LivestockDetails),
      },
    ]
  }
]