export const authSchemas = {
  RegisterRequest: {
    type: 'object',
    required: ['full_name', 'email', 'phone_number', 'password'],
    properties: {
      full_name: {
        type: 'string',
        example: 'John Doe',
        description: 'Full name of the user',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'john@example.com',
        description: 'Email address',
      },
      phone_number: {
        type: 'string',
        pattern: '^\\+2507[0-9]{8}$',
        example: '+250788123456',
        description: 'Rwandan phone number',
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        example: 'Password123',
        description: 'Password (min 8 chars, must contain uppercase, lowercase, and number)',
      },
    },
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'john@example.com',
      },
      password: {
        type: 'string',
        format: 'password',
        example: 'Password123',
      },
    },
  },
  UpdateProfileRequest: {
    type: 'object',
    properties: {
      full_name: {
        type: 'string',
        example: 'John Doe',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'john@example.com',
      },
      phone_number: {
        type: 'string',
        pattern: '^\\+2507[0-9]{8}$',
        example: '+250788123456',
      },
    },
  },
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1,
      },
      full_name: {
        type: 'string',
        example: 'John Doe',
      },
      email: {
        type: 'string',
        example: 'john@example.com',
      },
      phone_number: {
        type: 'string',
        example: '+250788123456',
      },
      role: {
        type: 'string',
        enum: ['passenger', 'admin'],
        example: 'passenger',
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
  AuthResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Login successful',
      },
      user: {
        $ref: '#/components/schemas/User',
      },
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  },
  RegisterResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Registration successful. Please login to continue.',
      },
      user: {
        $ref: '#/components/schemas/User',
      },
    },
  },
  LogoutResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Logged out successfully',
      },
    },
  },
  Error: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        example: 'Error message',
      },
      details: {
        type: 'array',
        items: {
          type: 'object',
        },
      },
    },
  },
};