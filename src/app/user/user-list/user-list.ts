import { Component } from '@angular/core';
import { UserDto } from '../../_shared/model/user-dto';
import { UserService } from '../../_shared/service/user-service';

@Component({
  selector: 'app-user-list',
  imports: [],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList {
  users: UserDto[] = []
  isLoading = false

  constructor(private readonly userService: UserService) {}

  ngOnInit() {
    this.isLoading = true

    this.userService.getAll().subscribe({
      next: users => this.users = users,
      error: err => alert(`Something went wrong: ${err}`)
    }).add(() => this.isLoading = false)
  }
}
