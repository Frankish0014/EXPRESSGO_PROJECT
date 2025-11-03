# ExpressGo–API

Complete authentication system with JWT, token blacklisting, and user management.

## Features

- ✅ User Registration with validation
- ✅ Login with JWT tokens
- ✅ Logout with token blacklisting
- ✅ Profile Management (Get/Update)
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ Error handling
- ✅ TypeScript support

## Installation

### 1. Install Dependencies

```bash
# From the backend directory
npm install
```

### 2. Setup Environment

```bash
# Copy and edit environment variables
cp env.example .env

# Required values
# PORT=3000
# NODE_ENV=development
# APP_NAME=ExpressGo Application
# APP_URL=http://localhost:3000
# JWT_SECRET=change-me
# JWT_EXPIRES_IN=7d
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=expressgo_db
# DB_USER=postgres
# DB_PASSWORD=postgres
```

### 3. Create Database

```bash
# Example (Postgres)
createdb expressgo_db
```

### 4. Run Migrations

```bash
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Running Tests

We use Jest with ts-jest and Supertest.

```bash
# Run once
npm test

# Watch mode
npm run test:watch
```

Test layout lives under `src/tests`:

```
src/tests/
├── setupTests.ts           # Global test setup (env, logging)
├── unit/                   # Unit tests
│   ├── responseUtils.test.ts
│   ├── authService.test.ts
│   └── middleware.auth.test.ts
└── integration/            # Integration tests (HTTP via Supertest)
    ├── health.test.ts
    └── authRoutes.test.ts
```

Notes:
- Tests run with `NODE_ENV=test` automatically via scripts.
- Integration tests mock DB models where appropriate to avoid real I/O.

## API Endpoints

### Health Check

```
GET /health
```

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user and receive JWT token
- `POST /api/auth/logout` - Logout user and invalidate token (authenticated)
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

## Testing with cURL

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+250788123456",
    "password": "Password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Get Profile

```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run db:migrate   # Run database migrations
npm run db:seed      # Run database seeders
```

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Sequelize** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation

## Project Structure

```
expressgo_project/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── tests/            # Unit & integration tests
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- Token blacklisting on logout
- Input validation and sanitization
- CORS and Helmet security headers
- SQL injection prevention (Sequelize ORM)

---
