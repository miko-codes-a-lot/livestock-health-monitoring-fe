import { FormControl } from "@angular/forms";

export interface RxLivestockClassificationForm {
  _id?: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  icon: FormControl<string>;
}
