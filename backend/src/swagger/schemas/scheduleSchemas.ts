export const scheduleSchemas = {
  BusCompany: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        example: 'Volcano Express',
      },
    },
  },
  Bus: {
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
      total_seats: {
        type: 'integer',
        example: 30,
      },
      company: {
        $ref: '#/components/schemas/BusCompany',
      },
    },
  },
  RouteInfo: {
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
        example: 95.5,
      },
      estimated_duration_minutes: {
        type: 'integer',
        example: 120,
      },
    },
  },
  Schedule: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1,
      },
      bus_id: {
        type: 'integer',
        example: 1,
      },
      route_id: {
        type: 'integer',
        example: 1,
      },
      departure_time: {
        type: 'string',
        format: 'time',
        example: '06:00:00',
      },
      arrival_time: {
        type: 'string',
        format: 'time',
        example: '08:00:00',
      },
      price: {
        type: 'number',
        format: 'decimal',
        example: 3000.0,
      },
      available_days: {
        type: 'string',
        example: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
      },
      is_active: {
        type: 'boolean',
        example: true,
      },
      bus: {
        $ref: '#/components/schemas/Bus',
      },
      route: {
        $ref: '#/components/schemas/RouteInfo',
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
  CreateScheduleRequest: {
    type: 'object',
    required: ['bus_id', 'route_id', 'departure_time', 'arrival_time', 'price'],
    properties: {
      bus_id: {
        type: 'integer',
        example: 1,
      },
      route_id: {
        type: 'integer',
        example: 1,
      },
      departure_time: {
        type: 'string',
        format: 'time',
        example: '06:00:00',
        description: 'Departure time in HH:MM:SS format',
      },
      arrival_time: {
        type: 'string',
        format: 'time',
        example: '08:00:00',
        description: 'Arrival time in HH:MM:SS format',
      },
      price: {
        type: 'number',
        format: 'decimal',
        example: 3000.0,
      },
      available_days: {
        type: 'string',
        example: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
      },
      is_active: {
        type: 'boolean',
        example: true,
      },
    },
  },
  UpdateScheduleRequest: {
    type: 'object',
    properties: {
      departure_time: {
        type: 'string',
        format: 'time',
        example: '06:00:00',
      },
      arrival_time: {
        type: 'string',
        format: 'time',
        example: '08:00:00',
      },
      price: {
        type: 'number',
        format: 'decimal',
        example: 3000.0,
      },
      is_active: {
        type: 'boolean',
        example: true,
      },
    },
  },
  AvailableSeatsResponse: {
    type: 'object',
    properties: {
      schedule_id: {
        type: 'integer',
        example: 1,
      },
      travel_date: {
        type: 'string',
        format: 'date',
        example: '2025-10-25',
      },
      available_seats: {
        type: 'array',
        items: {
          type: 'integer',
        },
        example: [1, 2, 3, 5, 7, 10, 15, 20],
      },
      total_available: {
        type: 'integer',
        example: 8,
      },
    },
  },
  SchedulesResponse: {
    type: 'object',
    properties: {
      schedules: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Schedule',
        },
      },
    },
  },
  ScheduleResponse: {
    type: 'object',
    properties: {
      schedule: {
        $ref: '#/components/schemas/Schedule',
      },
    },
  },
};