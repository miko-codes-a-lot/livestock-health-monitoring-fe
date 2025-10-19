export interface AddressDto {
  name: string
  level: number
  province?: string;
  children?: AddressDto[]
}