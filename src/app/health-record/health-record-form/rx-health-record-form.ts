import { FormControl } from '@angular/forms';

export interface RxHealthRecordForm {
  animal: FormControl<string>;
  bodyCondition: FormControl<string>;
  dewormingDate: FormControl<string>;
  diagnosis: FormControl<string>;
  notes: FormControl<string>;
  symptomsObserved: FormControl<string>;
  technician: FormControl<string>;
  treatmentGiven: FormControl<string>;
  vaccinationDate: FormControl<string>;
  visitDate: FormControl<string>;
  vitaminsAdministered: FormControl<string>;
  weightKg: FormControl<number>;
  status?: FormControl<string>;
}