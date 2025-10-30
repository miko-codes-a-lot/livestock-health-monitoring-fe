import { FormControl } from "@angular/forms";

export interface RxLivestockGroupForm {
  groupName: FormControl<string>;
  farmer: FormControl<string>;
  groupPhotos: FormControl<string[]>;
  status: FormControl< 'draft' | 'pending' | 'approved' | 'rejected' | 'verified'>;
}