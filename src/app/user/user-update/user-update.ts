import { Component } from '@angular/core';
import { UserForm } from '../user-form/user-form';
import { AddressDto } from '../../_shared/model/address-dto';
import { UserDto } from '../../_shared/model/user-dto';
import { AddressService } from '../../_shared/service/address-service';
import { UserService } from '../../_shared/service/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-update',
  imports: [UserForm],
  templateUrl: './user-update.html',
  styleUrl: './user-update.css'
})
export class UserUpdate {
  isLoading = false
  addresses: AddressDto[] = []
  user?: UserDto

  id!: string

  constructor(
    private readonly addressService: AddressService,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.isLoading = true
    this.id = this.route.snapshot.params['id']

    forkJoin({
      addresses: this.addressService.getAll(),
      user: this.userService.getOne(this.id),
    }).subscribe({
      next: ({ addresses, user }) => {
        this.addresses = addresses
        this.user = user
      },
      error: err => alert(`Something went wrong: ${err}`),
      complete: () => this.isLoading = false,
    })
  }

  onSubmit(user: UserDto) {
    this.userService.update(this.id, user).subscribe({
      next: data => {
        alert('User Successfully Updated!');
        this.router.navigate(['/user/details', data._id], { replaceUrl: true })
      },
      error: err => console.log(`Something went wrong: ${err}`)
    })
  }
}
