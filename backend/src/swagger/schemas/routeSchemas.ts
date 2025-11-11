export const routeSchemas = {
  Route: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1,
      },
      departure_city: {
        type: 'string',
        example: 'Kigali',
      },
      arrival_city: {
        type: 'string',
        example: 'Musanze',
      },
      distance_km: {
        type: 'number',
        format: 'decimal',
        example: 95.5,
      },
      estimated_duration_minutes: {
        type: 'integer',
        example: 120,
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
  CreateRouteRequest: {
    type: 'object',
    required: ['departure_city', 'arrival_city'],
    properties: {
      departure_city: {
        type: 'string',
        example: 'Kigali',
        description: 'Departure city',
      },
      arrival_city: {
        type: 'string',
        example: 'Musanze',
        description: 'Arrival city',
      },
      distance_km: {
        type: 'number',
        format: 'decimal',
        example: 95.5,
        description: 'Distance in kilometers',
      },
      estimated_duration_minutes: {
        type: 'integer',
        example: 120,
        description: 'Estimated duration in minutes',
      },
    },
  },
  UpdateRouteRequest: {
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
      distance_km: {
        type: 'number',
        format: 'decimal',
        example: 95.5,
      },
      estimated_duration_minutes: {
        type: 'integer',
        example: 120,
      },
    },
  },
  RoutesResponse: {
    type: 'object',
    properties: {
      routes: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Route',
        },
      },
    },
  },
  RouteResponse: {
    type: 'object',
    properties: {
      route: {
        $ref: '#/components/schemas/Route',
      },
    },
  },
};