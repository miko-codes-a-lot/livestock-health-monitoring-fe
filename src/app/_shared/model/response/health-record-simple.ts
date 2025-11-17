export interface HealthRecordSimple {
  _id?: string;
  animal: string;
  bodyCondition: string;
  createdAt: string;
  dewormingDate?: string;
  diagnosis?: string;
  notes?: string;
  symptomsObserved?: string;
  technician: string;
  treatmentGiven?: string;
  updatedAt?: string;
  vaccinationDate?: string;
  visitDate: string;
  vitaminsAdministered?: string;
  weightKg: number;
}
