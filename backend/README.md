# Urban Clap Backend

Backend API for Urban Clap - a service booking platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

4. Start MongoDB and Redis locally or use cloud services

5. Seed the database (optional):
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Providers
- `GET /api/providers` - Get all providers
- `GET /api/providers/:id` - Get provider details
- `POST /api/providers` - Register as provider

### Reviews
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Warranty
- `GET /api/warranty` - Get warranties
- `POST /api/warranty` - Create warranty claim

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/stats` - Get statistics

## Project Structure

```
backend/
├─ server.js                    # Entry point
├─ src/
│  ├─ app.js                    # Express app configuration
│  ├─ config/                   # Configuration files
│  ├─ controllers/              # Route controllers
│  ├─ models/                   # Mongoose models
│  ├─ routes/                   # API routes
│  ├─ middlewares/              # Custom middlewares
│  ├─ utils/                    # Utility functions
│  ├─ services/                 # Business logic
│  ├─ workers/                  # Background workers
│  ├─ jobs/                     # Job definitions
│  └─ tests/                    # Tests
├─ docker/                      # Docker configuration
└─ scripts/                     # Utility scripts
```

## Testing

```bash
npm test
```

## Docker

```bash
docker-compose up
```
