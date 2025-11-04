import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../_shared/service/auth-service';
import { UserService } from '../../_shared/service/user-service';
import { UserDto } from '../../_shared/model/user-dto';
import { FormControlErrorsComponent } from '../../_shared/component/form-control-errors/form-control-errors.component';
import { applyPHMobilePrefix } from '../../utils/forms/form-custom-format';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddressDto } from '../../_shared/model/address-dto';
import { AddressService } from '../../_shared/service/address-service';

@Component({
  selector: 'app-user-settings-update',
  templateUrl: './user-settings-update.html',
  styleUrl: './user-settings-update.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    FormControlErrorsComponent,
    MatProgressSpinnerModule
  ],
})
export class UserSettingsUpdate implements OnInit {
  profileForm!: FormGroup;
  user!: UserDto;
  isLoading = false;
  id = '';
  avatarUrl: string | null = null;
  addresses: AddressDto[] = []
  
  barangays: AddressDto[] = [];
  municipalities: AddressDto[] = [];

  constructor(
    private fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly addressService: AddressService,
  ) {}

  u: UserDto = this.user ?? {
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    emailAddress: '',
    mobileNumber: '',
    password: '',
    address: { province: '', municipality: '', barangay: '' },
    gender: 'male',
    role: 'admin',
    rsbsaNumber: ''
  };

  ngOnInit(): void {

    this.addressService.getAll().subscribe(addresses => {
      this.addresses = addresses
      console.log('this.addresses', this.addresses)
    })
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\+639\d{9}$/)]],
      username: ['', Validators.required],
      gender: ['', Validators.required],
      role: ['', Validators.required],
      address: this.fb.group({
        province: ['Occidental Mindoro'],
        municipality: ['', Validators.required],
        barangay: ['', Validators.required],
      }),
    });

    // auto-format PH numbers
    const mobileNumber = this.profileForm.get('mobileNumber');
    if (mobileNumber) applyPHMobilePrefix(mobileNumber);

    // populate from current user
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.id = user._id || '';
          if (user.profilePicture) this.loadProfilePicture(user._id!);
          this.profileForm.patchValue(user);

          if (user.role === 'farmer') {
            this.profileForm.addControl(
              'rsbsaNumber',
              this.fb.control(user.rsbsaNumber || '', Validators.required)
            );
          }

          this.addressService.getAll().subscribe((addresses) => {
            this.addresses = addresses;
            console.log('inside user', this.addresses);

            this.autoSelectBarangay(user.address.municipality, user.address.barangay);
          });
        }
      },
    });

    // Municipality (city/town) → update barangays
    this.profileForm.get('address.municipality')?.valueChanges.subscribe(value => {
      const selectedMunicipality = this.addresses.find(a => a.name === value);
      this.barangays = selectedMunicipality?.children ?? [];
      this.profileForm.get('address.barangay')?.patchValue('');
    });

  }

  autoSelectBarangay(municipalityName: string, barangayName: string) {
    // Find the municipality in the address list
    const municipality = this.addresses.find(a => a.name === municipalityName);
    if (municipality) {
      // Populate barangay dropdown
      this.barangays = municipality.children || [];

      // Wait a tick to ensure form controls are ready before setting barangay
      setTimeout(() => {
        this.profileForm.get('address.barangay')?.setValue(barangayName);
      });
    }
  }

  onMunicipalitySelected(municipalityName: string): void {
    const selectedMunicipality = this.addresses.find(a => a.name === municipalityName);
    this.barangays = selectedMunicipality?.children ?? [];
    this.profileForm.get('address.barangay')?.patchValue('');
  }

  loadProfilePicture(userId: string): void {
    this.userService.getProfilePicture(userId).subscribe({
      next: (url) => {
        this.avatarUrl = url;
        this.cdr.detectChanges();
      },
      error: () => (this.avatarUrl = null),
    });
  }


  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.avatarUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  cancelEdit(): void {
    this.router.navigate(['/user-settings/index']);
  }

  onSave(): void {
    if (this.profileForm.invalid || !this.id) {
      console.warn('Invalid form or missing ID:', this.profileForm.value);
      return;
    }

    this.isLoading = true;
    const formValue = this.profileForm.value;

    const updatedUser: UserDto = {
      _id: this.id,
      firstName: formValue.firstName,
      middleName: formValue.middleName || '',
      lastName: formValue.lastName,
      username: formValue.username,
      emailAddress: formValue.emailAddress,
      mobileNumber: formValue.mobileNumber,
      address: {
        province: formValue.address.province,
        municipality: formValue.address.municipality,
        barangay: formValue.address.barangay,
      },
      gender: formValue.gender,
      role: formValue.role,
      rsbsaNumber: formValue?.rsbsaNumber || '',
    };

    this.userService.update(this.id, updatedUser).subscribe({
      next: (res) => {
        alert('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert(`Something went wrong: ${err?.message || err}`);
      },
      complete: () => (this.isLoading = false),
    });
  }
}
