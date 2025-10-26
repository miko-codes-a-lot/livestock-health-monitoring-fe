export interface Claims {
  _id?: string;
  animal: string;
  causeOfDeath?: string;
  causeOfDeathCategory: string;
  createdAt: string;
  dateOfDeath: string;
  evidencePhotos?: string[]; // array of file names
  farmer: string;
  filedAt: string;
  policy: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending'; // add pending
  updatedAt: string;
}