import { Component } from '@angular/core';
import { UserDto } from '../../_shared/model/user-dto';
import { UserService } from '../../_shared/service/user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  imports: [],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList {
  users: UserDto[] = []
  isLoading = false

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.isLoading = true

    this.userService.getAll().subscribe({
      next: users => this.users = users,
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
