import { Routes } from "@angular/router";
import { User } from "./user";

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: User,
    children: [
      {
        path: '',
        redirectTo: '/user/list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./user-list/user-list').then(m => m.UserList),
      },
    ]
  }
]