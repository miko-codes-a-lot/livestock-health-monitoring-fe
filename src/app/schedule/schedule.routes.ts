import { Routes } from "@angular/router";
import { Schedule } from "./schedule";

export const SCHEDULE_ROUTES: Routes = [
  {
    path: '',
    component: Schedule,
    children: [
    ]
  }
]