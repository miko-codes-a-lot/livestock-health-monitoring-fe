import { UserDto } from "./user-dto";

export interface Livestock {
  _id?: string;
  tagNumber: string;
  species:  string 
  breed: string 
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
}