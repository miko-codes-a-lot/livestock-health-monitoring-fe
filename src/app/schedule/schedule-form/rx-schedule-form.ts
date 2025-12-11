import { FormControl } from "@angular/forms";

export interface RxScheduleForm {
  animal: FormControl<string>;
  healthRecord: FormControl<string>;
  assignedVet: FormControl<string>;
  farmer: FormControl<string>;
  type: FormControl<'vaccination' | 'deworming'>;
  scheduledDate: FormControl<string>; // ISO string (recommended)
  status?: FormControl<'pending' | 'approved' | 'declined' | 'completed'>;
}
