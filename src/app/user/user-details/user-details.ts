import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../_shared/service/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDto } from '../../_shared/model/user-dto';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-details.html',
  styleUrls: ['./user-details.css']
})
export class UserDetails {
  isLoading = false;
  user?: UserDto;

  constructor(
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];

    this.userService.getOne(id).subscribe({
      next: (user) => (this.user = user),
      error: (err) => alert(`Something went wrong: ${err}`),
    }).add(() => (this.isLoading = false));
  }

  onUpdate() {
    this.router.navigate(['/user/update', this.user!._id]);
  }
}
