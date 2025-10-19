import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RxUserForm } from './rx-user-form';
import { UserDto } from '../../_shared/model/user-dto';
import { AddressDto } from '../../_shared/model/address-dto';
import { applyPHMobilePrefix } from '../../utils/forms/form-custom-format';
import { passwordMatchValidator } from '../../utils/forms/form-custom-validator';

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
export class UserForm implements OnInit {
  @Input() isLoading = false;
  @Input() user?: UserDto;
  @Input() addresses: AddressDto[] = []; // City/town list
  @Output() onSubmit = new EventEmitter<UserDto>();

  barangays: AddressDto[] = [];
  municipalities: AddressDto[] = [];


  rxform!: FormGroup<RxUserForm>;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const u: UserDto = this.user ?? {
      firstName: '',
      middleName: '',
      lastName: '',
      username: '',
      emailAddress: '',
      mobileNumber: '',
      password: '',
      address: { province: '', municipality: '', barangay: '' },
      gender: 'male',
      role: 'admin'
    };

    this.rxform = this.fb.nonNullable.group({
      firstName: [u.firstName, Validators.required],
      middleName: [u.middleName ?? ''],
      lastName: [u.lastName, Validators.required],
      username: [u.username, Validators.required],
      password: [u.password ?? '', this.user ? [] : Validators.required],
      passwordConfirm: [''],
      emailAddress: [u.emailAddress, [Validators.required, Validators.email]],
      mobileNumber: [
        u.mobileNumber,
        [Validators.required, Validators.pattern(/^\+639\d{9}$/)]
      ],
      gender: this.fb.nonNullable.control<'male' | 'female'>(u.gender),
      role: this.fb.nonNullable.control<'admin' | 'farmer' | 'vet' | 'technician'>(u.role),
      address: this.fb.nonNullable.group({
        province: [u.address.province ?? ''], // ✅ optional
        // city: [''], // ✅ add this,
        municipality: [u.address.municipality, Validators.required],
        barangay: [u.address.barangay, Validators.required],
      }),
    }, {
      validators: passwordMatchValidator('password', 'passwordConfirm')
    });

    if (this.user) {
      this.rxform.patchValue(this.user);
    }

    const mobileNumber = this.rxform.get('mobileNumber');
    if (mobileNumber) applyPHMobilePrefix(mobileNumber);

    // Municipality (city/town) → update barangays
    this.rxform.get('address.municipality')?.valueChanges.subscribe(value => {
      const selectedMunicipality = this.addresses.find(a => a.name === value);
      this.barangays = selectedMunicipality?.children ?? [];
      this.rxform.get('address.barangay')?.patchValue('');
    });
  }

  onMunicipalitySelected(municipalityName: string): void {
    const selectedMunicipality = this.addresses.find(a => a.name === municipalityName);
    this.barangays = selectedMunicipality?.children ?? [];
    this.rxform.get('address.barangay')?.patchValue('');
  }

  onSave() {
    if (this.rxform.invalid) return;

    const userData: UserDto = {
      firstName: this.firstName.value,
      middleName: this.middleName.value,
      lastName: this.lastName.value,
      username: this.username.value,
      emailAddress: this.emailAddress.value,
      mobileNumber: this.mobileNumber.value,
      password: this.password?.value,
      address: {
        province: this.address.controls.province.value,
        municipality: this.address.controls.municipality.value,
        barangay: this.address.controls.barangay.value,
      },
      gender: this.gender.value,
      role: this.role.value,
    };

    if (!this.password?.value) delete (userData as any).password;
    this.onSubmit.emit(userData);
  }

  // --- Getters ---
  get username() { return this.rxform.controls.username; }
  get emailAddress() { return this.rxform.controls.emailAddress; }
  get mobileNumber() { return this.rxform.controls.mobileNumber; }
  get address() { return this.rxform.controls.address; }
  get gender() { return this.rxform.controls.gender; }
  get role() { return this.rxform.controls.role; }
  get password() { return this.rxform.controls.password; }
  get firstName() { return this.rxform.controls.firstName; }
  get middleName() { return this.rxform.controls.middleName; }
  get lastName() { return this.rxform.controls.lastName; }
}
