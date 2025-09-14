import { FormControl, FormGroup } from "@angular/forms"

export interface RxAddress {
  city: FormControl<string>
  barangay: FormControl<string>
}

export interface RxUserForm {
  username: FormControl<string>
  password: FormControl<string>
  passwordConfirm: FormControl<string>
  email: FormControl<string>
  mobileNumber: FormControl<string>
  address: FormGroup<RxAddress>
  gender: FormControl<string>
  role: FormControl<string>
}