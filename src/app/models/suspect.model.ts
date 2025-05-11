export interface Suspect {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;  // ISO string, e.g. '1990-05-08'
  gender: 'M' | 'F' | 'O' | 'U';
  nationality?: string;

  heightCm?: number;
  weightKg?: number;
  shoulderWidthCm?: number;
  torsoHeightCm?: number;
  legLengthCm?: number;
  shoeSize?: number;

  hairColor?: string;
  eyeColor?: string;

  aliases?: string;

  createdBy?: string;
  modifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;

  description?: string;
  isActive?: boolean;

  file_path?: string;

  image?: File;  // only for frontend image upload
  $$index?: number; // Add the $$index field to your interface
  file_blob_base64?: string;
}
