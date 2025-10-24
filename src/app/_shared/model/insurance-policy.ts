export interface InsurancePolicy {
  _id?: string;
  farmer: string;
  livestockGroup: string; 
  policyNumber: string; 
  provider: string;
  startDate: string; 
  endDate: string;
  policyDocument?: string; 
  status: 'pending' | 'approved' | 'rejected' | 'expired';
}
