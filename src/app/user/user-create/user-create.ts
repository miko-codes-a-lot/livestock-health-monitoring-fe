import { Component } from '@angular/core';
import { UserForm } from '../user-form/user-form';
import { UserService } from '../../_shared/service/user-service';
import { AddressService } from '../../_shared/service/address-service';
import { AddressDto } from '../../_shared/model/address-dto';
import { UserDto } from '../../_shared/model/user-dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-create',
  imports: [UserForm],
  templateUrl: './user-create.html',
  styleUrl: './user-create.css'
})
export class UserCreate {
  isLoading = false

  addresses: AddressDto[] = []

  constructor(
    private readonly addressService: AddressService,
    private readonly userService: UserService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.isLoading = true

    this.addressService.getAll().subscribe({
      next: data => this.addresses = data,
      error: err => console.log(`Something went wrong: ${err}`),
    }).add(() => this.isLoading = false)
  }

  onSubmit(user: UserDto) {
    this.userService.create(user).subscribe({
      next: data => this.router.navigate(['/user/details', data._id]),
      error: err => console.log(`Something went wrong: ${err}`)
    })
  }
}
