export interface LivestockGroup {
  _id: string;                // MongoDB ObjectId
  farmer: string;             // Reference to the farmer's ObjectId
  groupName: string;          // Name of the livestock group
  groupPhotos?: string[];      // Array of photo filenames or URLs
  status: 'pending' | 'approved' | 'rejected'; // You can extend status if needed
  createdAt: Date;            // Creation timestamp
  updatedAt: Date;            // Last update timestamp
  statusAt: Date;             // Timestamp when status was last updated
}
