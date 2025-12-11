export type ScheduleStatus = 'pending' | 'approved' | 'declined' | 'completed';
export type ScheduleType = 'vaccination' | 'deworming';

export interface Schedule {
  _id?: string;
  animal: string; // animal ID
  healthRecord: string; // health record ID
  createdBy?: string; // technician ID
  assignedVet: string; // vet ID
  farmer: string; // farmer ID
  type: ScheduleType;
  scheduledDate: string | Date; // you can use string (ISO) or Date object
  status: ScheduleStatus;
}
