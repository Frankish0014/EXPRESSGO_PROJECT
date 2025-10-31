import { Response } from 'express';

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
}

interface ErrorResponse {
  error: string;
  details?: any[];
}

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

export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 500,
  details?: any[]
): void => {
  const response: ErrorResponse = {
    error,
    details,
  };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): void => {
  sendSuccess(res, data, message, 201);
};