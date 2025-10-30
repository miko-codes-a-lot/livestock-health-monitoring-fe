import { FormControl, FormGroup } from "@angular/forms"

export interface RxAddress {
  province: FormControl<string>;
  municipality: FormControl<string>;
  barangay: FormControl<string>;
}

export interface RxUserForm {
  firstName: FormControl<string>;
  middleName: FormControl<string>;
  lastName: FormControl<string>;
  username: FormControl<string>
  password: FormControl<string>
  passwordConfirm: FormControl<string>
  emailAddress: FormControl<string>
  mobileNumber: FormControl<string>
  address: FormGroup<RxAddress>
  gender: FormControl<'male' | 'female'>;
  role: FormControl<'admin' | 'farmer' | 'vet' | 'technician'>;
  rsbsaNumber?: FormControl<string>
}