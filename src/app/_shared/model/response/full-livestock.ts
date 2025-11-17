import { LivestockBreed } from "../livestock-breed";
import { LivestockClassification } from "../livestock-classification";
import { HealthRecordSimple } from "./health-record-simple";

export interface FullLivestock {
  _id?: string;
  tagNumber: string;
  species: LivestockClassification;
  breed: LivestockBreed;
  sex: 'male' | 'female';
  age: number;
  dateOfPurchase: string;
  farmer: string;
  livestockGroup: string;
  animalPhotos?: string[];
  isInsured: boolean;
  isDeceased: boolean;
  status: 'pending' | 'approved' | 'rejected' | string;
  statusAt?: string;
  healthRecords: HealthRecordSimple[];
}