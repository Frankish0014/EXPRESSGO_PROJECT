export interface UserAttributes {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface RegisterInput {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  full_name?: string;
  email?: string;
  phone_number?: string;
}

export interface AuthResponse {
  user: Omit<UserAttributes, 'password_hash'>;
  token: string;
}

export interface JWTPayload {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
}

export interface ErrorResponse {
  error: string;
  details?: any[];
  stack?: string;
}