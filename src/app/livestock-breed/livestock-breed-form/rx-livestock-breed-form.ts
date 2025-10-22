import { FormControl } from "@angular/forms";

export interface RxLivestockBreedForm {
  name: FormControl<string>;
  classification: FormControl<string | { _id: string; name: string }>;
}