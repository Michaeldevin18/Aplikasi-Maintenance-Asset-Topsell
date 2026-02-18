export interface User {
  id: string;
  username: string;
  email: string;
  role: 'teknisi' | 'supervisor' | 'admin';
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance' | 'disposed';
  purchase_date: string | null;
  specification: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  technician_id: string | null;
  maintenance_type: 'preventive' | 'corrective';
  description: string;
  maintenance_date: string;
  completion_date: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  technician?: User; // Joined field
}

export interface AssetPhoto {
  id: string;
  asset_id: string;
  photo_url: string;
  photo_type: string | null;
  created_at: string;
}
