import { FormControl } from "@angular/forms";

export interface RxLivestockForm {
  tagNumber: FormControl<string>;
  species: FormControl<string>;
  breed: FormControl<string>;
  sex: FormControl<'male' | 'female'>;
  age: FormControl<number>;
  dateOfPurchase: FormControl<string>;
  isDeceased: FormControl<boolean>;
  isInsured: FormControl<boolean>;
  livestockGroup: FormControl<string>;
  farmer: FormControl<string>;
  status: FormControl<string>;
  animalPhotos: FormControl<string[]>; // array of file names or URLs
}
