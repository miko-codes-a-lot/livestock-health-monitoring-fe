import { FormControl } from "@angular/forms";

export interface RxInsurancePolicyForm {
  farmer: FormControl<string>;             // farmer ObjectId as string
  livestockGroup: FormControl<string>;     // livestock group ObjectId
  policyNumber: FormControl<string>;       // e.g., "PCIC-LIV-SJOM-2025-10-00123"
  provider: FormControl<string>;           // insurance provider
  startDate: FormControl<string>;          // ISO date string
  endDate: FormControl<string>;            // ISO date string
  policyDocument: FormControl<string>;     // filename or URL of document
  status: FormControl<'pending' | 'approved' | 'rejected' | 'expired'>; // status union
}