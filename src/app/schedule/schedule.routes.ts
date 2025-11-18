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
        loadComponent: () =>
          import('./schedule-list/schedule-list').then(m => m.ScheduleList),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./schedule-create/schedule-create').then(m => m.ScheduleCreate),
      },
      {
        path: 'update/:id',
        loadComponent: () =>
          import('./schedule-update/schedule-update').then(m => m.ScheduleUpdate),
      },
      {
        path: 'details/:id',
        loadComponent: () =>
          import('./schedule-details/schedule-details').then(m => m.ScheduleDetails),
      },
    ]
  }
];
