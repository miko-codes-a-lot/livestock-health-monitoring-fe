export interface AddressDto {
  name: string
  level: number
  children?: AddressDto[]
}