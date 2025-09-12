export interface UserDto {
  _id?: string
  username: string
  password?: string
  email: string
  mobileNumber: string
  address: string
  gender: 'male' | 'female'
  role: 'admin' | 'farmer' | 'vet'
}