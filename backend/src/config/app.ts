import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  },
  
  app: {
    name: process.env.APP_NAME || 'ExpressGo Application',
    url: process.env.APP_URL || 'http://localhost:3000',
  },
} as const;