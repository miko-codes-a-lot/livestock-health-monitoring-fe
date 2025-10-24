import { FormControl } from "@angular/forms";

export interface RxLivestockGroupForm {
  groupName: FormControl<string>;
  farmer: FormControl<string>;
  groupPhotos: FormControl<string[]>;
  status: FormControl<'pending' | 'approved' | 'rejected'>;
}