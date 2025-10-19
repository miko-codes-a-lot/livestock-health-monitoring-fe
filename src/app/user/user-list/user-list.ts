import { Component  } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDto } from '../../_shared/model/user-dto';
import { UserService } from '../../_shared/service/user-service';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user-list',

  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList {
  users: UserDto[] = []
  isLoading = false

  displayedColumns = [
    'username',
    'email',
    'mobileNumber',
    'address',
    'gender',
    'role',
    'action'
  ];

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.isLoading = true

    this.userService.getAll().subscribe({
      next: users => {
        this.users = users
        console.log('user', users)
      },
      error: err => alert(`Something went wrong: ${err}`)
    }).add(() => this.isLoading = false)
  }

  onCreate() {
    this.router.navigate(['/user/create'])
  }

  onDetails(id: string) {
    this.router.navigate(['/user/details', id])
  }

  onUpdate(id: string) {
    this.router.navigate(['/user/update', id])
  }
}
