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
      summary: 'Create a booking',
      description: 'Create a new seat booking for authenticated user',
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
  '/api/bookings/my-bookings': {
    get: {
      tags: ['Bookings'],
      summary: 'Get user bookings',
      description: 'Retrieve all bookings for authenticated user',
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
            example: 'BK1234ABCD',
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
  '/api/bookings/{code}': {
    delete: {
      tags: ['Bookings'],
      summary: 'Cancel booking',
      description: 'Cancel a confirmed booking by its code',
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
            example: 'BK1234ABCD',
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