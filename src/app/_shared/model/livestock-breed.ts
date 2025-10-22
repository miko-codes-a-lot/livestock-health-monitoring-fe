export interface LivestockBreed {
  _id?: string;
  name: string;
  classification: string | { _id: string; name: string };
}