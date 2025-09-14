import { Component } from '@angular/core';
import { UserService } from '../../_shared/service/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDto } from '../../_shared/model/user-dto';

@Component({
  selector: 'app-user-details',
  imports: [],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css'
})
export class UserDetails {
  isLoading = false
  user?: UserDto

  constructor(
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.isLoading = true
    const id = this.route.snapshot.params['id']

    this.userService.getOne(id).subscribe({
      next: user => this.user = user,
      error: err => alert(`Something went wrong: ${err}`),
    }).add(() => this.isLoading = false)
  }

  onUpdate() {
    this.router.navigate(['/user/update', this.user!._id])
  }
}
