export enum NotificationType {
  SCHEDULE_CREATED = 'SCHEDULE_CREATED',
  SCHEDULE_STATUS_UPDATED = 'SCHEDULE_STATUS_UPDATED',
  SCHEDULE_REMINDER = 'SCHEDULE_REMINDER',
}

export interface Notification {
  _id: string;
  recipient: string;
  message: string;
  read: boolean;
  type: NotificationType;
  link?: string;
  triggeredBy?: string;
  createdAt: string;
  updatedAt: string;
}
