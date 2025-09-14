import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDto } from '../model/user-dto';

const USERS: UserDto[] = [
  {
    _id: '65f6c827a5f67b5b4e1a4f00',
    username: 'johndoe',
    password: 'password123',
    email: 'john.doe@example.com',
    mobileNumber: '1234567890',
    address: {
      city: 'Lubang',
      barangay: 'Araw at Bituin',
    },
    gender: 'male',
    role: 'farmer'
  },
  {
    _id: '65f6c827a5f67b5b4e1a4f01',
    username: 'adminuser',
    password: 'securepassword',
    email: 'admin@example.com',
    mobileNumber: '0987654321',
    address: {
      city: 'Abra de Ilog',
      barangay: 'Armado',
    },
    gender: 'female',
    role: 'admin'
  },
  {
    _id: '65f6c827a5f67b5b4e1a4f02',
    username: 'janedoe',
    password: 'password456',
    email: 'jane.doe@example.com',
    mobileNumber: '1122334455',
    address: {
      city: 'Calintaan',
      barangay: 'Concepcion',
    },
    gender: 'female',
    role: 'vet'
  },
  {
    _id: '65f6c827a5f67b5b4e1a4f03',
    username: 'farmerbob',
    password: 'farmerpass',
    email: 'bob@farm.com',
    mobileNumber: '5566778899',
    address: {
      city: 'Looc',
      barangay: 'Agkawayan',
    },
    gender: 'male',
    role: 'farmer'
  }
]

@Injectable({
  providedIn: 'root'
})
export class UserService {
  getAll(): Observable<UserDto[]> {
    return new Observable<UserDto[]>((s) => {
      setTimeout(() => {
        s.next(USERS)
        s.complete()
      }, 1000);
    })
  }

  getOne(id: string): Observable<UserDto> {
    return new Observable<UserDto>((s) => {
      setTimeout(() => {
        const user = USERS.find(u => u._id === id)
        if (user) {
          s.next(user)
        } else {
          s.error(new Error(`User not found: ${id}`))
        }
        s.complete()
      }, 500);
    })
  }

  create(user: UserDto): Observable<UserDto> {
    return new Observable<UserDto>((s) => {
      setTimeout(() => {
        user._id = '68c721b9f5d77e0fd3fe2812'

        const exist = USERS.find(u => u._id === user._id)
        if (!exist) USERS.push(user)

        s.next(user)
        s.complete()
      }, 500);
    })
  }
}
