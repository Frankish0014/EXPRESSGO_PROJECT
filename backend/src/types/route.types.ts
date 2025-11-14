export interface CreateRouteInput {
  departure_city: string;
  arrival_city: string;
  distance_km?: number;
  estimated_duration_minutes?: number;
}

export interface UpdateRouteInput {
  departure_city?: string;
  arrival_city?: string;
  distance_km?: number;
  estimated_duration_minutes?: number;
}

export interface RouteResponse {
  id: number;
  departure_city: string;
  arrival_city: string;
  distance_km?: number;
  estimated_duration_minutes?: number;
  created_at: Date;
  updated_at: Date;
}

export interface RouteQueryParams {
  departure_city?: string;
  arrival_city?: string;
}