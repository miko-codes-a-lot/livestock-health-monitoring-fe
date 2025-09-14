export interface UserDto {
  _id?: string
  username: string
  password?: string
  email: string
  mobileNumber: string
  address: {
    city: string,
    barangay: string,
  }
  gender: 'male' | 'female'
  role: 'admin' | 'farmer' | 'vet'
}