import { Injectable } from '@angular/core';
import { UserDto } from '../model/user-dto';
import { Notification, NotificationType } from '../model/notification';


@Injectable({
  providedIn: 'root'
})
export class MockService {
  mockUser(): UserDto {
    return {
      _id: '68c37415c08e5f89eddba5de',
      firstName: 'juan',
      middleName: 'juan',
      lastName: 'juan',
      username: 'juan',
      emailAddress: 'user@email.com',
      gender: 'male',
      mobileNumber: '+9394111011',
      role: 'admin',
      address: {
        province: 'Looc',
        barangay: 'Agkawayan',
        municipality: 'unknown',
      }
    }
  }
  mockNotification(): Notification {
    const now = new Date().toISOString(); 
    
    return {
      _id: '635f8e5b9f7a4b1c8e8f8b8a', // Example of a MongoDB ObjectId string
      recipient: '1', // Corresponds to the recipient user's ID
      message: 'Patient Juan Dela Cruz booked a new appointment.',
      read: false,
      type: NotificationType.APPOINTMENT_CREATED, // Use the enum for type safety
      link: '/appointments/507f1f77bcf86cd799439011', // Optional link
      triggeredBy: '1', // Corresponds to the old 'createdBy', now a user ID string
      createdAt: now,
      updatedAt: now,
    };
  }
}
