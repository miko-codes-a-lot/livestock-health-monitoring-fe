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
        loadChildren: () => import('./livestock-create/livestock-create').then(m => m.LivestockCreate),
      },
      {
        path: 'update',
        loadChildren: () => import('./livestock-update/livestock-update').then(m => m.LivestockUpdate),
      },
      {
        path: 'details',
        loadChildren: () => import('./livestock-details/livestock-details').then(m => m.LivestockDetails),
      }
    ]
  }
]