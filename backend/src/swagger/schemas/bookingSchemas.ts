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
        example: 'BK1234ABCD',
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
        example: '2025-10-25',
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
      created_at: {
        type: 'string',
        format: 'date-time',
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
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
        example: '2025-10-25',
        description: 'Date of travel (YYYY-MM-DD)',
      },
      seat_number: {
        type: 'integer',
        example: 15,
        description: 'Seat number to book',
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