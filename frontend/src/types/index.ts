export interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  current_mileage: number;
  mileage_updated_at: string;
  nickname: string | null;
  created_at: string;
}

export interface VehicleCreate {
  year: number;
  make: string;
  model: string;
  trim?: string;
  current_mileage: number;
  nickname?: string;
}

export interface MaintenanceRecord {
  id: number;
  vehicle_id: number;
  service_type: string;
  service_label: string;
  performed_at: string;
  mileage_at: number;
  shop_name: string | null;
  cost: number | null;
  notes: string | null;
  created_at: string;
}

export interface MaintenanceRecordCreate {
  service_type: string;
  service_label: string;
  performed_at: string;
  mileage_at: number;
  shop_name?: string;
  cost?: number;
  notes?: string;
}

export interface ScheduleTemplate {
  id: number;
  service_type: string;
  service_label: string;
  interval_miles: number | null;
  interval_months: number | null;
  description: string | null;
  applies_to_make: string | null;
  applies_to_model: string | null;
  applies_to_year_min: number | null;
  applies_to_year_max: number | null;
  severity: string;
  is_custom: boolean;
  source: string;
}

export interface ServiceStatus {
  service_type: string;
  service_label: string;
  severity: string;
  description: string | null;
  status: 'overdue' | 'due_soon' | 'ok' | 'unknown';
  last_performed_date: string | null;
  last_performed_mileage: number | null;
  next_due_mileage: number | null;
  next_due_date: string | null;
  miles_remaining: number | null;
  days_remaining: number | null;
  interval_miles: number | null;
  interval_months: number | null;
}

export interface VehicleStatus {
  vehicle_id: number;
  current_mileage: number;
  items: ServiceStatus[];
}

export interface DashboardVehicle {
  vehicle_id: number;
  year: number;
  make: string;
  model: string;
  nickname: string | null;
  current_mileage: number;
  overdue_count: number;
  due_soon_count: number;
  overdue: ServiceStatus[];
  due_soon: ServiceStatus[];
  recent: {
    service_type: string;
    service_label: string;
    performed_at: string;
    mileage_at: number;
  }[];
}

export interface Dashboard {
  vehicles: DashboardVehicle[];
}
