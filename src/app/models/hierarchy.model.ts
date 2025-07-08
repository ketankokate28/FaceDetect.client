export interface Site {
  id: number;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  address?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Subnode {
  id: number;
  name: string;
  country: string;
  state: string;
  district?: string;
  taluka?: string;
  pincode?: string;
  full_address?: string;
  is_active: boolean;
  created_at?: string;
  sites: Site[];
}

export interface Node {
  id: number;
  name: string;
  type?: string;
  description?: string;
  created_at?: string;
  subnodes: Subnode[];
}

export interface Tenant {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  nodes: Node[];
}
