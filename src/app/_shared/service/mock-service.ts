import { Injectable } from '@angular/core';
import { UserDto } from '../model/user-dto';

@Injectable({
  providedIn: 'root'
})
export class MockService {
  mockUser(): UserDto {
    return {
      _id: '68c37415c08e5f89eddba5de',
      username: 'juan',
      email: 'user@email.com',
      gender: 'male',
      mobileNumber: '+9394111011',
      role: 'admin',
      address: {
        city: 'Looc',
        barangay: 'Agkawayan',
      }
    }
  }
}
