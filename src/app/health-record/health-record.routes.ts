import { Routes } from "@angular/router";
import { HealthRecord } from "./health-record";

export const HEALTH_RECORD_ROUTES: Routes = [
  {
    path: '',
    component: HealthRecord,
    children: [
    ]
  }
]