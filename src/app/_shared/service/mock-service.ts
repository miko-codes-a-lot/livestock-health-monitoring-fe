import { Injectable } from '@angular/core';
import { UserDto } from '../model/user-dto';

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
}
