export const routePaths = {
  '/api/routes': {
    get: {
      tags: ['Routes'],
      summary: 'Get all routes',
      description: 'Retrieve all available bus routes',
      responses: {
        200: {
          description: 'Routes retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RoutesResponse',
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
      tags: ['Routes'],
      summary: 'Create a new route',
      description: 'Create a new bus route (Admin only)',
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
              $ref: '#/components/schemas/CreateRouteRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Route created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Route created successfully',
                  },
                  route: {
                    $ref: '#/components/schemas/Route',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Route already exists',
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
  '/api/routes/{id}': {
    get: {
      tags: ['Routes'],
      summary: 'Get route by ID',
      description: 'Retrieve a specific route by its ID',
      parameters: [
        {
          name: 'id',
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
          description: 'Route retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RouteResponse',
              },
            },
          },
        },
        404: {
          description: 'Route not found',
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
      tags: ['Routes'],
      summary: 'Update a route',
      description: 'Update an existing route (Admin only)',
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
          description: 'Route ID',
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
              $ref: '#/components/schemas/UpdateRouteRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Route updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Route updated successfully',
                  },
                  route: {
                    $ref: '#/components/schemas/Route',
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
          description: 'Route not found',
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
      tags: ['Routes'],
      summary: 'Delete a route',
      description: 'Delete an existing route (Admin only)',
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
          description: 'Route ID',
          schema: {
            type: 'integer',
            example: 1,
          },
        },
      ],
      responses: {
        200: {
          description: 'Route deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Route deleted successfully',
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
          description: 'Route not found',
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
  '/api/routes/departure/{departure}': {
    get: {
      tags: ['Routes'],
      summary: 'Get routes by departure city',
      description: 'Retrieve all routes from a specific departure city',
      parameters: [
        {
          name: 'departure',
          in: 'path',
          required: true,
          description: 'Departure city name',
          schema: {
            type: 'string',
            example: 'Kigali',
          },
        },
      ],
      responses: {
        200: {
          description: 'Routes retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RoutesResponse',
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