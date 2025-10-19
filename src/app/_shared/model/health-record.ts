export interface HealthRecord {
  _id?: string;
  animal: string;               // references the animal ID
  bodyCondition: string;
  createdAt: string;            // ISO date string
  dewormingDate?: string;       // ISO date string
  diagnosis?: string;
  notes?: string;
  symptomsObserved?: string;
  technician: string;           // references the technician ID
  treatmentGiven?: string;
  updatedAt?: string;           // ISO date string
  vaccinationDate?: string;     // ISO date string
  visitDate: string;            // ISO date string
  vitaminsAdministered?: string;
  weightKg: number;
}
