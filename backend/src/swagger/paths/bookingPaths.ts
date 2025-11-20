export const bookingPaths = {
  '/api/bookings': {
    get: {
      tags: ['Bookings'],
      summary: 'Get all bookings',
      description: 'Retrieve all bookings (Admin only)',
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: 'Bookings retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BookingsResponse',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        403: {
          description: 'Forbidden - Admin access required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['Bookings'],
      summary: 'Create a one-way booking',
      description: 'Create a new one-way seat booking for authenticated user',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateBookingRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Booking created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BookingResponse',
              },
            },
          },
        },
        400: {
          description: 'Bad request - Seat not available or already booked',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              examples: {
                seatTaken: {
                  value: {
                    error: 'Seat is not available',
                  },
                },
                pastDate: {
                  value: {
                    error: 'Travel date cannot be in the past',
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        404: {
          description: 'Schedule not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        422: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/bookings/round-trip': {
    post: {
      tags: ['Bookings'],
      summary: 'Create a round-trip booking',
      description: 'Create a booking for both outbound and return journeys. Both legs will be linked with a single booking code.',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateRoundTripBookingRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Round-trip booking created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RoundTripBookingResponse',
              },
            },
          },
        },
        400: {
          description: 'Bad request - Invalid dates or seats not available',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              examples: {
                invalidDate: {
                  summary: 'Invalid return date',
                  value: {
                    error: 'Return date must be after departure date',
                  },
                },
                outboundSeatTaken: {
                  summary: 'Outbound seat unavailable',
                  value: {
                    error: 'Outbound seat is not available',
                  },
                },
                returnSeatTaken: {
                  summary: 'Return seat unavailable',
                  value: {
                    error: 'Return seat is not available',
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        422: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/bookings/multi-city': {
    post: {
      tags: ['Bookings'],
      summary: 'Create a multi-city booking',
      description: 'Create a booking with multiple journey legs (2-5 cities). All legs will be linked with a single booking code.',
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateMultiCityBookingRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Multi-city booking created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MultiCityBookingResponse',
              },
            },
          },
        },
        400: {
          description: 'Bad request - Invalid leg count, dates, or seats not available',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              examples: {
                legCount: {
                  summary: 'Invalid leg count',
                  value: {
                    error: 'Multi-city booking requires at least 2 legs',
                  },
                },
                maxLegs: {
                  summary: 'Too many legs',
                  value: {
                    error: 'Maximum 5 legs allowed for multi-city booking',
                  },
                },
                chronological: {
                  summary: 'Invalid date order',
                  value: {
                    error: 'Travel dates must be in chronological order',
                  },
                },
                seatUnavailable: {
                  summary: 'Seat not available',
                  value: {
                    error: 'Seat 15 is not available for leg 2',
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        422: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/bookings/my-bookings': {
    get: {
      tags: ['Bookings'],
      summary: 'Get user bookings',
      description: 'Retrieve all bookings for authenticated user (including one-way, round-trip, and multi-city)',
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: 'Bookings retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BookingsResponse',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/bookings/code/{code}': {
    get: {
      tags: ['Bookings'],
      summary: 'Get booking by code',
      description: 'Retrieve a specific booking by its booking code',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: 'code',
          in: 'path',
          required: true,
          description: 'Booking code',
          schema: {
            type: 'string',
            example: 'BK2511181430ABCD000001',
          },
        },
      ],
      responses: {
        200: {
          description: 'Booking retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  booking: {
                    $ref: '#/components/schemas/Booking',
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        404: {
          description: 'Booking not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/bookings/complete/{code}': {
    get: {
      tags: ['Bookings'],
      summary: 'Get complete booking with all legs',
      description: 'Retrieve a booking with all associated legs (useful for round-trip and multi-city bookings to see all related journeys)',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: 'code',
          in: 'path',
          required: true,
          description: 'Main booking code',
          schema: {
            type: 'string',
            example: 'BK2511181430ABCD000001',
          },
        },
      ],
      responses: {
        200: {
          description: 'Complete booking retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CompleteBookingResponse',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        404: {
          description: 'Booking not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/bookings/{code}': {
    delete: {
      tags: ['Bookings'],
      summary: 'Cancel one-way booking',
      description: 'Cancel a confirmed one-way booking by its code',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: 'code',
          in: 'path',
          required: true,
          description: 'Booking code',
          schema: {
            type: 'string',
            example: 'BK2511181430ABCD000001',
          },
        },
      ],
      responses: {
        200: {
          description: 'Booking cancelled successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Booking cancelled successfully',
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        404: {
          description: 'Booking not found or already cancelled',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/bookings/complex/{code}': {
    delete: {
      tags: ['Bookings'],
      summary: 'Cancel complex booking',
      description: 'Cancel a round-trip or multi-city booking (cancels all related legs atomically)',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: 'code',
          in: 'path',
          required: true,
          description: 'Main booking code',
          schema: {
            type: 'string',
            example: 'BK2511181430ABCD000001',
          },
        },
      ],
      responses: {
        200: {
          description: 'Booking cancelled successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CancelComplexBookingResponse',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        404: {
          description: 'Booking not found or already cancelled',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              examples: {
                notFound: {
                  value: {
                    error: 'Booking not found or already cancelled',
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/bookings/{id}/status': {
    put: {
      tags: ['Bookings'],
      summary: 'Update booking status',
      description: 'Update the status of a booking (Admin only)',
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Booking ID',
          schema: {
            type: 'integer',
            example: 1,
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateBookingStatusRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Booking status updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Booking status updated successfully',
                  },
                  booking: {
                    $ref: '#/components/schemas/Booking',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Bad request - Invalid status',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        403: {
          description: 'Forbidden - Admin access required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        404: {
          description: 'Booking not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        422: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
};
