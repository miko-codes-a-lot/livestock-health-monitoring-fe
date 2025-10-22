import { Routes } from "@angular/router";
import { LivestockBreed } from "./livestock-breed";

export const LIVESTOCK_BREED_ROUTES: Routes = [
  {
    path: '',
    component: LivestockBreed,
    children: [
      {
        path: '',
        redirectTo: '/livestock-breed/list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./livestock-breed-list/livestock-breed-list').then(m => m.LivestockBreedList),
      },
      {
        path: 'create',
        loadComponent: () => import('./livestock-breed-create/livestock-breed-create').then(m => m.LivestockBreedCreate),
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./livestock-breed-update/livestock-breed-update').then(m => m.LivestockBreedUpdate),
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./livestock-breed-details/livestock-breed-details').then(m => m.LivestockBreedDetails),
      },
    ]
  }
]