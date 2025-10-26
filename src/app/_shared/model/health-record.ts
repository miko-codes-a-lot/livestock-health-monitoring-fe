import { Livestock } from "./livestock";
import { UserDto } from "./user-dto";

export interface HealthRecord {
  _id?: string;
  animal: Livestock;
  bodyCondition: string;
  createdAt: string;            // ISO date string
  dewormingDate?: string;       // ISO date string
  diagnosis?: string;
  notes?: string;
  symptomsObserved?: string;
  technician: UserDto;
  treatmentGiven?: string;
  updatedAt?: string;           // ISO date string
  vaccinationDate?: string;     // ISO date string
  visitDate: string;            // ISO date string
  vitaminsAdministered?: string;
  weightKg: number;
}
