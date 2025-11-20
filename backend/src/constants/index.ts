/**
 * Application constants
 */

// User roles
export const USER_ROLES = {
  PASSENGER: 'passenger',
  ADMIN: 'admin',
} as const;

// Booking status
export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

// Booking types
export const BOOKING_TYPES = {
  ONE_WAY: 'one-way',
  ROUND_TRIP: 'round-trip',
  MULTI_CITY: 'multi-city',
} as const;

// Bus status
export const BUS_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
} as const;

// Days of week
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

// Time constants
export const TIME_CONSTANTS = {
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
} as const;

// Validation constants
export const VALIDATION_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_SEAT_NUMBER: 1,
  MAX_SEAT_NUMBER: 100,
  MIN_PRICE: 0,
  MAX_PRICE: 1000000,
  MIN_DISTANCE: 0,
  MAX_DISTANCE: 10000,
  PHONE_LENGTH: 13, // +250788123456
} as const;

// Multi-city constraints
export const MULTI_CITY_CONSTRAINTS = {
  MIN_LEGS: 2,
  MAX_LEGS: 5,
} as const;

// Rwandan cities (major destinations)
export const RWANDAN_CITIES = [
  'Kigali',
  'Musanze',
  'Huye',
  'Rubavu',
  'Rusizi',
  'Nyagatare',
  'Karongi',
  'Muhanga',
  'Nyanza',
  'Rwamagana',
  'Kayonza',
  'Bugesera',
  'Kirehe',
  'Ngoma',
  'Ruhango',
] as const;

// Bus types
export const BUS_TYPES = {
  COASTER: 'Coaster',
  BUS: 'Bus',
  MINIBUS: 'Minibus',
  LUXURY: 'Luxury Bus',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// JWT constants
export const JWT_CONSTANTS = {
  DEFAULT_EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  PHONE_ALREADY_EXISTS: 'Phone number already registered',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Insufficient permissions',

  // Booking errors
  BOOKING_NOT_FOUND: 'Booking not found',
  SEAT_NOT_AVAILABLE: 'Seat is not available',
  INVALID_TRAVEL_DATE: 'Invalid travel date',
  PAST_DATE: 'Travel date cannot be in the past',
  BOOKING_ALREADY_CANCELLED: 'Booking is already cancelled',
  RETURN_DATE_INVALID: 'Return date must be after departure date',
  MULTI_CITY_LEG_COUNT: 'Multi-city booking requires 2-5 legs',
  CHRONOLOGICAL_ORDER: 'Travel dates must be in chronological order',
  COMPLEX_BOOKING_NOT_FOUND: 'Complex booking not found or already cancelled',

  // Route errors
  ROUTE_NOT_FOUND: 'Route not found',
  ROUTE_ALREADY_EXISTS: 'Route already exists',

  // Schedule errors
  SCHEDULE_NOT_FOUND: 'Schedule not found',
  INVALID_TIME_FORMAT: 'Invalid time format',

  // Validation errors
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input data',

  // Server errors
  SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database error occurred',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  // Auth
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  PROFILE_UPDATED: 'Profile updated successfully',

  // Booking
  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_CANCELLED: 'Booking cancelled successfully',
  BOOKING_STATUS_UPDATED: 'Booking status updated successfully',
  ROUND_TRIP_CREATED: 'Round-trip booking created successfully',
  MULTI_CITY_CREATED: 'Multi-city booking created successfully',
  COMPLEX_BOOKING_CANCELLED: 'All legs of your booking have been cancelled successfully',

  // Route
  ROUTE_CREATED: 'Route created successfully',
  ROUTE_UPDATED: 'Route updated successfully',
  ROUTE_DELETED: 'Route deleted successfully',

  // Schedule
  SCHEDULE_CREATED: 'Schedule created successfully',
  SCHEDULE_UPDATED: 'Schedule updated successfully',
  SCHEDULE_DELETED: 'Schedule deleted successfully',
} as const;

// Regex patterns
export const REGEX_PATTERNS = {
  RWANDAN_PHONE: /^\+2507[0-9]{8}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TIME_FORMAT: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
  BOOKING_CODE: /^BK[A-Z0-9]+$/,
  PLATE_NUMBER: /^R[A-Z]{2}\s?\d{3}\s?[A-Z]$/,
} as const;

// API routes
export const API_ROUTES = {
  AUTH: {
    BASE: '/api/auth',
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/profile',
  },
  ROUTES: {
    BASE: '/api/routes',
    BY_ID: '/api/routes/:id',
    BY_DEPARTURE: '/api/routes/departure/:departure',
  },
  SCHEDULES: {
    BASE: '/api/schedules',
    BY_ID: '/api/schedules/:id',
    BY_ROUTE: '/api/schedules/route/:routeId',
    AVAILABLE_SEATS: '/api/schedules/:scheduleId/available-seats',
  },
  BOOKINGS: {
    BASE: '/api/bookings',
    MY_BOOKINGS: '/api/bookings/my-bookings',
    BY_CODE: '/api/bookings/code/:code',
    BY_ID: '/api/bookings/:id',
    UPDATE_STATUS: '/api/bookings/:id/status',
    ROUND_TRIP: '/api/bookings/round-trip',
    MULTI_CITY: '/api/bookings/multi-city',
    COMPLETE: '/api/bookings/complete/:code',
    CANCEL_COMPLEX: '/api/bookings/complex/:code',
  },
} as const;

// Environment variables keys
export const ENV_KEYS = {
  PORT: 'PORT',
  NODE_ENV: 'NODE_ENV',
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_NAME: 'DB_NAME',
  DB_USER: 'DB_USER',
  DB_PASSWORD: 'DB_PASSWORD',
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
} as const;
