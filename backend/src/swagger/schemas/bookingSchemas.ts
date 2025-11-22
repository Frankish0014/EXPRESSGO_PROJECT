export const bookingSchemas = {
  Booking: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1,
      },
      booking_code: {
        type: 'string',
        example: 'BK2511181430ABCD000001',
      },
      user_id: {
        type: 'integer',
        example: 1,
      },
      schedule_id: {
        type: 'integer',
        example: 1,
      },
      travel_date: {
        type: 'string',
        format: 'date',
        example: '2025-11-25',
      },
      seat_number: {
        type: 'integer',
        example: 15,
      },
      status: {
        type: 'string',
        enum: ['confirmed', 'cancelled', 'completed'],
        example: 'confirmed',
      },
      booking_type: {
        type: 'string',
        enum: ['one-way', 'round-trip', 'multi-city'],
        example: 'one-way',
        description: 'Type of booking: one-way, round-trip, or multi-city',
      },
      parent_booking_id: {
        type: 'integer',
        nullable: true,
        example: null,
        description: 'Parent booking ID for linked bookings (round-trip/multi-city)',
      },
      leg_sequence: {
        type: 'integer',
        nullable: true,
        example: null,
        description: 'Sequence number for multi-city booking legs (1, 2, 3...)',
      },
      return_travel_date: {
        type: 'string',
        format: 'date',
        nullable: true,
        example: null,
        description: 'Return date for round-trip bookings',
      },
      user: {
        type: 'object',
        properties: {
          full_name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            example: 'john@example.com',
          },
          phone_number: {
            type: 'string',
            example: '+250788123456',
          },
        },
      },
      schedule: {
        type: 'object',
        properties: {
          departure_time: {
            type: 'string',
            example: '06:00:00',
          },
          arrival_time: {
            type: 'string',
            example: '08:00:00',
          },
          price: {
            type: 'number',
            example: 3000.0,
          },
          bus: {
            type: 'object',
            properties: {
              plate_number: {
                type: 'string',
                example: 'RAC 001 A',
              },
              bus_type: {
                type: 'string',
                example: 'Coaster',
              },
              company: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'Volcano Express',
                  },
                },
              },
            },
          },
          route: {
            type: 'object',
            properties: {
              departure_city: {
                type: 'string',
                example: 'Kigali',
              },
              arrival_city: {
                type: 'string',
                example: 'Musanze',
              },
            },
          },
        },
      },
      childBookings: {
        type: 'array',
        nullable: true,
        description: 'Child bookings for round-trip or multi-city',
        items: {
          $ref: '#/components/schemas/Booking',
        },
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        example: '2025-11-18T14:30:00.000Z',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        example: '2025-11-18T14:30:00.000Z',
      },
    },
  },
  CreateBookingRequest: {
    type: 'object',
    required: ['schedule_id', 'travel_date', 'seat_number'],
    properties: {
      schedule_id: {
        type: 'integer',
        example: 1,
        description: 'ID of the bus schedule',
      },
      travel_date: {
        type: 'string',
        format: 'date',
        example: '2025-11-25',
        description: 'Date of travel (YYYY-MM-DD)',
      },
      seat_number: {
        type: 'integer',
        example: 15,
        description: 'Seat number to book',
        minimum: 1,
      },
    },
  },
  CreateRoundTripBookingRequest: {
    type: 'object',
    required: ['outbound', 'return'],
    properties: {
      outbound: {
        type: 'object',
        required: ['schedule_id', 'travel_date', 'seat_number'],
        properties: {
          schedule_id: {
            type: 'integer',
            example: 1,
            description: 'Outbound schedule ID',
          },
          travel_date: {
            type: 'string',
            format: 'date',
            example: '2025-11-20',
            description: 'Outbound travel date',
          },
          seat_number: {
            type: 'integer',
            example: 15,
            description: 'Outbound seat number',
            minimum: 1,
          },
        },
      },
      return: {
        type: 'object',
        required: ['schedule_id', 'travel_date', 'seat_number'],
        properties: {
          schedule_id: {
            type: 'integer',
            example: 5,
            description: 'Return schedule ID (can be same or different route)',
          },
          travel_date: {
            type: 'string',
            format: 'date',
            example: '2025-11-25',
            description: 'Return travel date (must be after outbound date)',
          },
          seat_number: {
            type: 'integer',
            example: 20,
            description: 'Return seat number',
            minimum: 1,
          },
        },
      },
    },
    example: {
      outbound: {
        schedule_id: 1,
        travel_date: '2025-11-20',
        seat_number: 15,
      },
      return: {
        schedule_id: 5,
        travel_date: '2025-11-25',
        seat_number: 20,
      },
    },
  },
  CreateMultiCityBookingRequest: {
    type: 'object',
    required: ['legs'],
    properties: {
      legs: {
        type: 'array',
        minItems: 2,
        maxItems: 5,
        description: 'Journey legs (minimum 2, maximum 5 legs allowed)',
        items: {
          type: 'object',
          required: ['schedule_id', 'travel_date', 'seat_number', 'sequence'],
          properties: {
            schedule_id: {
              type: 'integer',
              example: 1,
              description: 'Schedule ID for this leg',
            },
            travel_date: {
              type: 'string',
              format: 'date',
              example: '2025-11-20',
              description: 'Travel date for this leg',
            },
            seat_number: {
              type: 'integer',
              example: 15,
              description: 'Seat number for this leg',
              minimum: 1,
            },
            sequence: {
              type: 'integer',
              example: 1,
              description: 'Sequence order of this leg (1, 2, 3...)',
              minimum: 1,
            },
          },
        },
        example: [
          {
            schedule_id: 1,
            travel_date: '2025-11-20',
            seat_number: 15,
            sequence: 1,
          },
          {
            schedule_id: 5,
            travel_date: '2025-11-21',
            seat_number: 10,
            sequence: 2,
          },
          {
            schedule_id: 8,
            travel_date: '2025-11-22',
            seat_number: 8,
            sequence: 3,
          },
        ],
      },
    },
  },
  RoundTripBookingResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Round-trip booking created successfully',
      },
      booking: {
        type: 'object',
        properties: {
          booking_code: {
            type: 'string',
            example: 'BK2511181430ABCD000001',
            description: 'Main booking code for the round-trip',
          },
          booking_type: {
            type: 'string',
            example: 'round-trip',
          },
          outbound: {
            allOf: [
              { $ref: '#/components/schemas/Booking' },
              {
                type: 'object',
                description: 'Outbound journey details',
              },
            ],
          },
          return: {
            allOf: [
              { $ref: '#/components/schemas/Booking' },
              {
                type: 'object',
                description: 'Return journey details (booking_code will be MAIN_CODE-RTN)',
              },
            ],
          },
          total_price: {
            type: 'number',
            example: 6000.0,
            description: 'Combined price of outbound and return journeys',
          },
        },
      },
    },
  },
  MultiCityBookingResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Multi-city booking created successfully',
      },
      booking: {
        type: 'object',
        properties: {
          booking_code: {
            type: 'string',
            example: 'BK2511181430ABCD000001',
            description: 'Main booking code for the multi-city journey',
          },
          booking_type: {
            type: 'string',
            example: 'multi-city',
          },
          legs: {
            type: 'array',
            description: 'All journey legs in sequence order',
            items: {
              allOf: [
                { $ref: '#/components/schemas/Booking' },
                {
                  type: 'object',
                  description: 'Each leg has booking_code like MAIN_CODE-L2, MAIN_CODE-L3, etc.',
                },
              ],
            },
          },
          total_price: {
            type: 'number',
            example: 9000.0,
            description: 'Combined price of all journey legs',
          },
        },
      },
    },
  },
  CompleteBookingResponse: {
    type: 'object',
    properties: {
      booking: {
        allOf: [
          { $ref: '#/components/schemas/Booking' },
          {
            type: 'object',
            properties: {
              childBookings: {
                type: 'array',
                description: 'All related bookings (return leg or additional city legs)',
                items: {
                  $ref: '#/components/schemas/Booking',
                },
              },
            },
          },
        ],
      },
    },
  },
  CancelComplexBookingResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Booking cancelled successfully',
      },
      cancelled_bookings: {
        type: 'array',
        description: 'All cancelled bookings (parent and children)',
        items: {
          $ref: '#/components/schemas/Booking',
        },
      },
    },
  },
  UpdateBookingStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['confirmed', 'cancelled', 'completed'],
        example: 'completed',
        description: 'New booking status',
      },
    },
  },
  BookingsResponse: {
    type: 'object',
    properties: {
      bookings: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Booking',
        },
      },
    },
  },
  BookingResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Booking created successfully',
      },
      booking: {
        $ref: '#/components/schemas/Booking',
      },
    },
  },
};
