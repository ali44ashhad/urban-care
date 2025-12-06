# API Testing Collection

You can import this into Postman or use with REST Client extension.

## Authentication

### Register User
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "9876543210"
}

### Login
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Current User
GET http://localhost:5000/api/v1/auth/me
Authorization: Bearer YOUR_TOKEN_HERE

## Services

### Get All Services
GET http://localhost:5000/api/v1/services

### Get Single Service
GET http://localhost:5000/api/v1/services/SERVICE_ID

### Create Service (Admin Only)
POST http://localhost:5000/api/v1/services
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "House Cleaning",
  "description": "Professional cleaning service",
  "category": "cleaning",
  "price": 500,
  "duration": 120
}

## Bookings

### Get User Bookings
GET http://localhost:5000/api/v1/bookings
Authorization: Bearer YOUR_TOKEN

### Create Booking
POST http://localhost:5000/api/v1/bookings
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "service": "SERVICE_ID",
  "provider": "PROVIDER_ID",
  "scheduledDate": "2025-12-15",
  "scheduledTime": "10:00 AM",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}

## Reviews

### Create Review
POST http://localhost:5000/api/v1/reviews
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "booking": "BOOKING_ID",
  "rating": 5,
  "comment": "Excellent service!"
}

### Get Reviews
GET http://localhost:5000/api/v1/reviews?service=SERVICE_ID
