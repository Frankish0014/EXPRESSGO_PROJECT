import { Response } from 'express';
import { ApiResponse, ErrorResponse } from '../types';

/**
 * Response utility functions for consistent API responses
 */

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    message,
    data,
  };
  res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 500,
  details?: any[]
): void => {
  const response: ErrorResponse = {
    error,
    details,
    ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack }),
  };
  res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): void => {
  sendSuccess(res, data, message, 201);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

/**
 * Send not found error (404)
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): void => {
  sendError(res, message, 404);
};

/**
 * Send bad request error (400)
 */
export const sendBadRequest = (
  res: Response,
  message: string,
  details?: any[]
): void => {
  sendError(res, message, 400, details);
};

/**
 * Send unauthorized error (401)
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): void => {
  sendError(res, message, 401);
};

/**
 * Send forbidden error (403)
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden - Insufficient permissions'
): void => {
  sendError(res, message, 403);
};

/**
 * Send validation error (422)
 */
export const sendValidationError = (
  res: Response,
  details: any[],
  message: string = 'Validation failed'
): void => {
  sendError(res, message, 422, details);
};

/**
 * Send conflict error (409)
 */
export const sendConflict = (
  res: Response,
  message: string = 'Resource conflict'
): void => {
  sendError(res, message, 409);
};

/**
 * Send internal server error (500)
 */
export const sendServerError = (
  res: Response,
  message: string = 'Internal server error'
): void => {
  sendError(res, message, 500);
};

/**
 * Send paginated response
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): void => {
  const response = {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
  res.status(200).json(response);
};