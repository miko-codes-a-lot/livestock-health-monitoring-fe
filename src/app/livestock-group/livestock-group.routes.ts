import { Routes } from "@angular/router";
import { LivestockGroup } from "./livestock-group";

export const LIVESTOCK_ROUTES: Routes = [
  {
    path: '',
    component: LivestockGroup,
    children: [
      {
        path: '',
        redirectTo: '/livestock-group/list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./livestock-group-list/livestock-group-list').then(m => m.LivestockList),
      },
      {
        path: 'create',
        loadComponent: () => import('./livestock-group-create/livestock-group-create').then(m => m.LivestockCreate),
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./livestock-group-update/livestock-update').then(m => m.LivestockUpdate),
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./livestock-group-details/livestock-group-details').then(m => m.LivestockDetails),
      },
    ]
  }
]