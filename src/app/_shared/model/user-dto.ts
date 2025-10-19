export interface UserDto {
  _id?: string
  firstName: string
  middleName: string
  lastName: string
  username: string
  password?: string
  emailAddress: string
  mobileNumber: string
  address: {
    province: string,
    municipality: string,
    barangay: string,
  }
  gender: 'male' | 'female'
  role: 'admin' | 'farmer' | 'vet'
}