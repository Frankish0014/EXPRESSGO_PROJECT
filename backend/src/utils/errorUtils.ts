/**
 * Error utility functions and custom error classes
 */

/**
 * Custom application error class
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', details?: any) {
    super(message, 400, true, details);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, true);
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 422, true, details);
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, false);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database error', details?: any) {
    super(message, 500, false, details);
  }
}

/**
 * Handle async errors in route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Parse error message from various error types
 */
export const parseErrorMessage = (error: any): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error.name === 'SequelizeValidationError') {
    return error.errors.map((e: any) => e.message).join(', ');
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return 'Duplicate entry found';
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return 'Referenced resource does not exist';
  }

  if (error.name === 'JsonWebTokenError') {
    return 'Invalid authentication token';
  }

  if (error.name === 'TokenExpiredError') {
    return 'Authentication token has expired';
  }

  return error.message || 'An unexpected error occurred';
};

/**
 * Get HTTP status code from error
 */
export const getErrorStatusCode = (error: any): number => {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error.name === 'SequelizeValidationError') {
    return 422;
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return 409;
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return 401;
  }

  return 500;
};

/**
 * Check if error is operational
 */
export const isOperationalError = (error: any): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Log error details
 */
export const logErrorDetails = (error: any, context?: string): void => {
  const timestamp = new Date().toISOString();
  const logMessage = [
    `[${timestamp}]`,
    context ? `[${context}]` : '',
    error.message,
    error.stack,
  ]
    .filter(Boolean)
    .join(' ');

  console.error(logMessage);

  if (error.details) {
    console.error('Error details:', JSON.stringify(error.details, null, 2));
  }
};

/**
 * Format error for API response
 */
export const formatErrorResponse = (error: any) => {
  return {
    error: parseErrorMessage(error),
    ...(error instanceof AppError && error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };
};