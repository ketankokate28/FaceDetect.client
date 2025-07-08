export interface Site {
  id?: number;                // optional when creating
  subnode_id: number;

  name: string;
  description?: string;

  latitude?: number;
  longitude?: number;
  altitude?: number;

  address?: string;

  dvr_ip?: string;
  dvr_port?: number;
  dvr_username?: string;
  dvr_password?: string;
  dvr_rtsp_url?: string;

  dvr_model?: string;
  dvr_vendor?: string;
  dvr_firmware_version?: string;

  last_maintenance_date?: string; // ISO date string: YYYY-MM-DD

  is_active?: boolean;

  created_at?: string;  // optional, set by backend
  updated_at?: string;  // optional, set by backend
}
