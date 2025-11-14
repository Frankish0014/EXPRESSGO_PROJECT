export interface CreateScheduleInput {
  bus_id: number;
  route_id: number;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_days?: string;
  is_active?: boolean;
}

export interface UpdateScheduleInput {
  departure_time?: string;
  arrival_time?: string;
  price?: number;
  is_active?: boolean;
}

export interface ScheduleResponse {
  id: number;
  bus_id: number;
  route_id: number;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_days: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ScheduleWithDetails extends ScheduleResponse {
  bus: {
    plate_number: string;
    bus_type: string;
    total_seats: number;
    company: {
      name: string;
    };
  };
  route: {
    departure_city: string;
    arrival_city: string;
    distance_km?: number;
    estimated_duration_minutes?: number;
  };
}

export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday';

export interface ScheduleQueryParams {
  route_id?: number;
  is_active?: boolean;
  departure_city?: string;
}