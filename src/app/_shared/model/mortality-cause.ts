export interface MortalityCauseItem {
  value: string; // e.g., 'snake_bite', 'drowning'
  label: string; // e.g., 'Snake Bite', 'Drowning'
}

export interface MortalityCause {
  _id?: string;           // MongoDB ObjectId
  value: string;           // top-level value, e.g., 'accident'
  items: MortalityCauseItem[]; // list of detailed causes
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
  __v?: number;            // Mongoose version key
}