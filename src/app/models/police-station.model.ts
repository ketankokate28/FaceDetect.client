export interface PoliceStation {
  id: number;
  name: string;
  country: string;
  state: string;
  district?: string;
  taluka: string;
  pincode: string;
  fullAddress: string | null;
  isActive: boolean;
  stationHouseOfficerId: number | null;
  stationHouseOfficerName: string | null;
  createdBy: number | null;
  createdAt: string | null;
  updatedBy: number | null;
  updatedAt: string | null;
}
