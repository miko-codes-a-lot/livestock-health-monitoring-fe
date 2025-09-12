import { Routes } from "@angular/router";
import { Schedule } from "./schedule";

export const SCHEDULE_ROUTES: Routes = [
  {
    path: '',
    component: Schedule,
    children: [
      {
        path: '',
        redirectTo: '/schedule/list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./schedule-list/schedule-list').then(m => m.ScheduleList),
      },
      {
        path: 'create',
        loadChildren: () => import('./schedule-create/schedule-create').then(m => m.ScheduleCreate),
      },
      {
        path: 'update',
        loadChildren: () => import('./schedule-update/schedule-update').then(m => m.ScheduleUpdate),
      },
      {
        path: 'details',
        loadChildren: () => import('./schedule-details/schedule-details').then(m => m.ScheduleDetails),
      },
    ]
  }
]