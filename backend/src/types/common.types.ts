export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: any[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  details?: any[];
  stack?: string;
}

export interface SuccessResponse {
  message: string;
}

export type SortOrder = 'ASC' | 'DESC';

export interface SortParams {
  sortBy?: string;
  order?: SortOrder;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface TimeRange {
  startTime: string;
  endTime: string;
}