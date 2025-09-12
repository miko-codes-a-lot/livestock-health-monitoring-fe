import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    const roles = ['admin', 'farmer', 'vet']
    const userRole = roles[0]

    console.log('wtf')

    this.router.navigate([`dashboard/${userRole}`])
  }
}
