import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    const roles = ['admin', 'farmer', 'vet']
    const userRole = roles[0]

    this.router.navigate([`dashboard/${userRole}`])
  }
}
