import { Routes } from "@angular/router";
import { Treatment } from "./treatment";

export const TREATMENT_ROUTES: Routes = [
  {
    path: '',
    component: Treatment,
    children: [
    ]
  }
]