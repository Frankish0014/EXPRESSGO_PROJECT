export interface CreateBookingInput {
  schedule_id: number;
  travel_date: Date;
  seat_number: number;
}

export interface UpdateBookingStatusInput {
  status: BookingStatus;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface BookingResponse {
  id: number;
  booking_code: string;
  user_id: number;
  schedule_id: number;
  travel_date: Date;
  seat_number: number;
  status: BookingStatus;
  created_at: Date;
  updated_at: Date;
}

export interface BookingWithDetails extends BookingResponse {
  user: {
    full_name: string;
    email: string;
    phone_number: string;
  };
  schedule: {
    departure_time: string;
    arrival_time: string;
    price: number;
    bus: {
      plate_number: string;
      company: {
        name: string;
      };
    };
    route: {
      departure_city: string;
      arrival_city: string;
    };
  };
}

export interface AvailableSeatsResponse {
  schedule_id: number;
  travel_date: string;
  available_seats: number[];
  total_available: number;
}