import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDto } from '../model/user-dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  getAll(): Observable<UserDto[]> {
    return new Observable<UserDto[]>((s) => {
      const users: UserDto[] = [
        {
          _id: '65f6c827a5f67b5b4e1a4f00',
          username: 'johndoe',
          password: 'password123',
          email: 'john.doe@example.com',
          mobileNumber: '1234567890',
          address: '123 Farm Rd, Rural Town',
          gender: 'male',
          role: 'farmer'
        },
        {
          _id: '65f6c827a5f67b5b4e1a4f01',
          username: 'adminuser',
          password: 'securepassword',
          email: 'admin@example.com',
          mobileNumber: '0987654321',
          address: '456 Main St, Cityville',
          gender: 'female',
          role: 'admin'
        },
        {
          _id: '65f6c827a5f67b5b4e1a4f02',
          username: 'janedoe',
          password: 'password456',
          email: 'jane.doe@example.com',
          mobileNumber: '1122334455',
          address: '789 Vet Clinic, Suburbia',
          gender: 'female',
          role: 'vet'
        },
        {
          _id: '65f6c827a5f67b5b4e1a4f03',
          username: 'farmerbob',
          password: 'farmerpass',
          email: 'bob@farm.com',
          mobileNumber: '5566778899',
          address: '101 Country Lane, Farmland',
          gender: 'male',
          role: 'farmer'
        }
      ]
      setTimeout(() => {
        s.next(users)
        s.complete()
      }, 1000);
    })
  }
}
