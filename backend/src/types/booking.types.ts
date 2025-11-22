export interface CreateBookingInput {
  schedule_id: number;
  travel_date: Date;
  seat_number: number;
  booking_type?: 'one-way' | 'round-trip' | 'multi-city';
}

export interface CreateRoundTripBookingInput {
  outbound: {
    schedule_id: number;
    travel_date: Date;
    seat_number: number;
  };
  return: {
    schedule_id: number;
    travel_date: Date;
    seat_number: number;
  };
}

export interface CreateMultiCityBookingInput {
  legs: Array<{
    schedule_id: number;
    travel_date: Date;
    seat_number: number;
    sequence: number;
  }>;
}

export interface UpdateBookingStatusInput {
  status: BookingStatus;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';
export type BookingType = 'one-way' | 'round-trip' | 'multi-city';

export interface BookingResponse {
  id: number;
  booking_code: string;
  user_id: number;
  schedule_id: number;
  travel_date: Date;
  seat_number: number;
  status: BookingStatus;
  booking_type: BookingType;
  parent_booking_id?: number;
  leg_sequence?: number;
  return_travel_date?: Date;
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
  childBookings?: BookingWithDetails[];
  parentBooking?: BookingWithDetails;
}

export interface RoundTripBookingResponse {
  booking_code: string;
  booking_type: 'round-trip';
  outbound: BookingWithDetails;
  return: BookingWithDetails;
  total_price: number;
}

export interface MultiCityBookingResponse {
  booking_code: string;
  booking_type: 'multi-city';
  legs: BookingWithDetails[];
  total_price: number;
}

export interface AvailableSeatsResponse {
  schedule_id: number;
  travel_date: string;
  available_seats: number[];
  total_available: number;
}
