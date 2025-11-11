export const schedulePaths = {
  '/api/schedules': {
    get: {
      tags: ['Schedules'],
      summary: 'Get all schedules',
      description: 'Retrieve all active bus schedules',
      responses: {
        200: {
          description: 'Schedules retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SchedulesResponse',
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
      tags: ['Schedules'],
      summary: 'Create a new schedule',
      description: 'Create a new bus schedule (Admin only)',
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
              $ref: '#/components/schemas/CreateScheduleRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Schedule created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Schedule created successfully',
                  },
                  schedule: {
                    $ref: '#/components/schemas/Schedule',
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
  '/api/schedules/{id}': {
    get: {
      tags: ['Schedules'],
      summary: 'Get schedule by ID',
      description: 'Retrieve a specific schedule by its ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Schedule ID',
          schema: {
            type: 'integer',
            example: 1,
          },
        },
      ],
      responses: {
        200: {
          description: 'Schedule retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ScheduleResponse',
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
    put: {
      tags: ['Schedules'],
      summary: 'Update a schedule',
      description: 'Update an existing schedule (Admin only)',
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
          description: 'Schedule ID',
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
              $ref: '#/components/schemas/UpdateScheduleRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Schedule updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Schedule updated successfully',
                  },
                  schedule: {
                    $ref: '#/components/schemas/Schedule',
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
    delete: {
      tags: ['Schedules'],
      summary: 'Delete a schedule',
      description: 'Delete an existing schedule (Admin only)',
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
          description: 'Schedule ID',
          schema: {
            type: 'integer',
            example: 1,
          },
        },
      ],
      responses: {
        200: {
          description: 'Schedule deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Schedule deleted successfully',
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
          description: 'Schedule not found',
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
  '/api/schedules/route/{routeId}': {
    get: {
      tags: ['Schedules'],
      summary: 'Get schedules by route',
      description: 'Retrieve all schedules for a specific route',
      parameters: [
        {
          name: 'routeId',
          in: 'path',
          required: true,
          description: 'Route ID',
          schema: {
            type: 'integer',
            example: 1,
          },
        },
      ],
      responses: {
        200: {
          description: 'Schedules retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SchedulesResponse',
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
  '/api/schedules/{scheduleId}/available-seats': {
    get: {
      tags: ['Schedules'],
      summary: 'Get available seats',
      description: 'Check available seats for a schedule on a specific date',
      parameters: [
        {
          name: 'scheduleId',
          in: 'path',
          required: true,
          description: 'Schedule ID',
          schema: {
            type: 'integer',
            example: 1,
          },
        },
        {
          name: 'travel_date',
          in: 'query',
          required: true,
          description: 'Travel date (YYYY-MM-DD)',
          schema: {
            type: 'string',
            format: 'date',
            example: '2025-10-25',
          },
        },
      ],
      responses: {
        200: {
          description: 'Available seats retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AvailableSeatsResponse',
              },
            },
          },
        },
        400: {
          description: 'Bad request - Travel date is required',
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