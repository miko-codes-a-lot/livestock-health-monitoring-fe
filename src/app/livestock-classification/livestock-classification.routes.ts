import { Routes } from "@angular/router";
import { LivestockClassification } from "./livestock-classification";

export const LIVESTOCK_CLASSIFICATION_ROUTES: Routes = [
  {
    path: '',
    component: LivestockClassification,
    children: [
      {
        path: '',
        redirectTo: '/livestock-classification/list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./livestock-classification-list/livestock-classification-list').then(m => m.LivestockClassificationList),
      },
      {
        path: 'create',
        loadComponent: () => import('./livestock-classification-create/livestock-classification-create').then(m => m.LivestockClassificationCreate),
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./livestock-classification-update/livestock-classification-update').then(m => m.LivestockClassificationUpdate),
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./livestock-classification-details/livestock-classification-details').then(m => m.LivestockClassificationDetails),
      },
    ]
  }
]