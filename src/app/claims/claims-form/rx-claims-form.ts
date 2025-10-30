import { FormControl } from "@angular/forms";

export interface RxClaimsForm {
  animal: FormControl<string>;                     // corresponds to animal ID
  causeOfDeath?: FormControl<string>;               // cause of death
  causeOfDeathCategory: FormControl<string>;       // category of cause
  dateOfDeath: FormControl<string>;                // date string
  evidencePhotos: FormControl<string[]>;           // array of file names or URLs
  farmer: FormControl<string>;                     // farmer ID
  filedAt: FormControl<string>;                    // filed timestamp
  policy: FormControl<string>;                     // policy ID
  status: FormControl<'draft' | 'submitted' | 'approved' | 'rejected' | 'pending'>;
  otherCauseOfDeath: FormControl<string>; 
}
