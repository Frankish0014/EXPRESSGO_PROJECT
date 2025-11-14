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
  user: UserResponse;
  token: string;
}

export interface UserResponse {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: 'passenger' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  id: number;
  email: string;
  role: 'passenger' | 'admin';
}

export interface AuthRequest {
  user?: JWTPayload;
}