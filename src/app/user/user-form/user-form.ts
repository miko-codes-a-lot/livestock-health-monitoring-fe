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
import { AuthService } from '../../_shared/service/auth-service';


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

  availableRoles: Array<{ value: 'admin' | 'farmer' | 'technician', label: string }> = [];

  loggedInUserRole: 'admin' | 'farmer' | 'vet' | 'technician' = 'admin';

  barangays: AddressDto[] = [];
  municipalities: AddressDto[] = [];

  isRoleFarmer: boolean = false;


  rxform!: FormGroup<RxUserForm>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
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
    
    // 1. Get the logged-in user's role FIRST
      this.authService.currentUser$.subscribe({
        next: (u) => {
          if (u) {
            // 💡 FIX: Store the role in the new property, NOT this.user
            this.loggedInUserRole = u.role;
          }
          this.setAvailableRoles(); 
        }
      });

      if (this.user?.role === 'farmer') { // Check if the user being edited is a farmer
        this.isRoleFarmer = true;
        // ... rest of farmer specific logic (rsbsaNumber control)
      }

    this.initializeForm();
    this.setAvailableRoles();
     if (this.user) {
      this.rxform.patchValue(this.user);

        // Check if the role is 'farmer'
        if (this.user.role === 'farmer') {
          this.isRoleFarmer = true;

          // Add rsbsaNumber control if it doesn't exist yet
          if (!this.rxform.get('rsbsaNumber')) {
            (this.rxform as FormGroup<any>).addControl(
              'rsbsaNumber',
              this.fb.control(this.user.rsbsaNumber || '', Validators.required)
            );
          }
        }

      }
  }

      private setAvailableRoles(): void {
          type RoleOption = { 
              value: 'admin' | 'farmer' | 'technician', 
              label: string 
          };
          const allRoles: RoleOption[] = [
              { value: 'admin', label: 'Admin' },
              { value: 'technician', label: 'Technician' },
              { value: 'farmer', label: 'Farmer' }
          ];

          // Check the role of the LOGGED-IN user
          if (this.loggedInUserRole === 'technician') { // 💡 FIX IS HERE
              this.availableRoles = allRoles.filter(role => role.value === 'farmer');
              
              // Auto-select 'farmer' and disable the dropdown if in CREATE mode (no user being edited)
              if (!this.user) { // Check if @Input() user is NOT defined (i.e., Create Mode)
                  this.rxform.controls.role.setValue('farmer');
                  this.rxform.controls.role.disable(); // Technician can only create a farmer
              } else {
                  // If editing, technician can view the current role, but cannot change it 
                  // unless the current role is already 'farmer' (and you'll likely want to disable change anyway)
                  this.rxform.controls.role.disable();
              }

          } else if (this.loggedInUserRole === 'admin') { // 💡 FIX IS HERE
              this.availableRoles = allRoles;
              this.rxform.controls.role.enable(); // Admins can change roles
          } else {
              // ... (other roles or default)
              this.availableRoles = allRoles;
          }
      }

  private initializeForm(): void {
    // const u: UserDto = this.user ?? {
    //   firstName: '',
    //   middleName: '',
    //   lastName: '',
    //   username: '',
    //   emailAddress: '',
    //   mobileNumber: '',
    //   password: '',
    //   address: { province: '', municipality: '', barangay: '' },
    //   gender: 'male',
    //   role: 'admin'
    // };
    this.rxform = this.fb.nonNullable.group({
      firstName: [this.u.firstName, Validators.required],
      middleName: [this.u.middleName ?? ''],
      lastName: [this.u.lastName, Validators.required],
      username: [this.u.username, Validators.required],
      password: [this.u.password ?? '', this.user ? [] : Validators.required],
      passwordConfirm: [''],
      emailAddress: [this.u.emailAddress, [Validators.required, Validators.email]],
      mobileNumber: [
        this.u.mobileNumber,
        [Validators.required, Validators.pattern(/^\+639\d{9}$/)]
      ],
      gender: this.fb.nonNullable.control<'male' | 'female'>(this.u.gender),
      role: this.fb.nonNullable.control<'admin' | 'farmer' | 'vet' | 'technician'>(this.u.role as any),
      address: this.fb.nonNullable.group({
        province: ['Occidental Mindoro'],
        // city: [''], // add this,
        municipality: [this.u.address.municipality, Validators.required],
        barangay: [this.u.address.barangay, Validators.required],
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
      rsbsaNumber: this.rsbsaNumber?.value
    };

    if (!this.password?.value) delete (userData as any).password;
    this.onSubmit.emit(userData);
  }

  onRoleChange(selectedValue: string) {
    if(selectedValue === 'farmer') {
      this.isRoleFarmer = true

      if (!this.rxform.get('rsbsaNumber')) {
        (this.rxform as FormGroup<any>).addControl(
          'rsbsaNumber',
          this.fb.control(this.u.rsbsaNumber || '', Validators.required)
        );
      }
    } else {
      this.isRoleFarmer = false
    }
    // this.selectedCategoryValue = selectedValue;
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
  get rsbsaNumber() { return this.rxform.controls.rsbsaNumber; }
}
