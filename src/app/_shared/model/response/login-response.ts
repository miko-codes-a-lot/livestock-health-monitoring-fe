import { UserDto } from "../user-dto"

export interface LoginResponse {
  message: string
  user: UserDto
}