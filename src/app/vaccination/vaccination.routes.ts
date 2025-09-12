import { Routes } from "@angular/router";
import { Vaccination } from "./vaccination";

export const VACCINATION_ROUTES: Routes = [
  {
    path: '',
    component: Vaccination,
    children: [
    ]
  }
]