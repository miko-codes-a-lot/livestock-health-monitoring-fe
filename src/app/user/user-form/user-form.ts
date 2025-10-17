import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RxUserForm } from './rx-user-form';
import { UserDto } from '../../_shared/model/user-dto';
import { AddressDto } from '../../_shared/model/address-dto';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.css']
})
export class UserForm {
  @Input() isLoading = false;

  @Input() user: UserDto = {
    username: '',
    email: '',
    mobileNumber: '',
    address: {
      city: '',
      barangay: '',
    },
    gender: 'male',
    role: 'admin'
  };

  @Input() addresses: AddressDto[] = [];
  barangays: AddressDto[] = [];

  @Output() onSubmit = new EventEmitter<UserDto>();

  rxform!: FormGroup<RxUserForm>;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.rxform = this.fb.nonNullable.group({
      username: [this.user.username],
      password: [''],
      passwordConfirm: [''],
      address: this.fb.nonNullable.group({
        city: [this.user.address.city],
        barangay: [this.user.address.barangay],
      }),
      email: [this.user.email],
      gender: ['' + this.user.gender],
      mobileNumber: [this.user.mobileNumber],
      role: ['' + this.user.role],
    });

    // Init barangays if editing
    const city = this.addresses.find(a => a.name === this.user.address.city);
    if (city) {
      this.barangays = city.children ?? [];
    }

    // React to city changes
    this.address.controls.city.valueChanges.subscribe((v) => {
      const city = this.addresses.find(a => a.name === v);
      if (!city) return;

      // clear barangay
      this.address.controls.barangay.patchValue('');
      this.barangays = city.children ?? [];
    });
  }

  onSave() {
    const output: UserDto = {
      username: this.username.value,
      email: this.email.value,
      mobileNumber: this.mobileNumber.value,
      address: {
        city: this.address.controls.city.value,
        barangay: this.address.controls.barangay.value,
      },
      gender: this.gender.value as any,
      role: this.role.value as any,
    };
    this.onSubmit.emit(output);
  }

  get username() { return this.rxform.controls.username; }
  get email() { return this.rxform.controls.email; }
  get mobileNumber() { return this.rxform.controls.mobileNumber; }
  get address() { return this.rxform.controls.address; }
  get gender() { return this.rxform.controls.gender; }
  get role() { return this.rxform.controls.role; }
}
