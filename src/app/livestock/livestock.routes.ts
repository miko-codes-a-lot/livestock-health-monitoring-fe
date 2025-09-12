import { Routes } from "@angular/router";
import { Livestock } from "./livestock";

export const LIVESTOCK_ROUTES: Routes = [
  {
    path: '',
    component: Livestock,
    children: [
    ]
  }
]