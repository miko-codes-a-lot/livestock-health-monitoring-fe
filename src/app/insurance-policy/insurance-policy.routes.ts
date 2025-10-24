import { Routes } from "@angular/router";
import { InsurancePolicy } from "./insurance-policy";

export const INSURANCE_POLICY_ROUTES: Routes = [
  {
    path: '',
    component: InsurancePolicy,
    children: [
      {
        path: '',
        redirectTo: '/insurance-policy/list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./insurance-policy-list/insurance-policy-list').then(m => m.InsurancePolicyList),
      },
      {
        path: 'create',
        loadComponent: () => import('./insurance-policy-create/insurance-policy-create').then(m => m.InsurancePolicyCreate),
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./insurance-policy-update/insurance-policy-update').then(m => m.InsurancePolicyUpdate),
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./insurance-policy-details/insurance-policy-details').then(m => m.InsurancePolicyDetails),
      },
    ]
  }
]