/**
 * OpenAPI 3.0 specification for Stunn API
 * Base URL: /api/v1
 */
module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Stunn API',
    description: 'Backend API for Stunn - service booking, categories, warranties, and admin operations.',
    version: '1.0.0',
  },
  servers: [
    { url: '/api/v1', description: 'API v1' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token from login/register',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['client', 'provider', 'admin'] },
          phone: { type: 'string' },
          avatar: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SavedAddress: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          label: { type: 'string' },
          name: { type: 'string' },
          phone: { type: 'string' },
          line1: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          pincode: { type: 'string' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          clientId: { type: 'string' },
          providerId: { type: 'string' },
          serviceId: { type: 'string' },
          status: { type: 'string' },
          price: { type: 'number' },
          slot: { type: 'object' },
          address: { type: 'object' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          icon: { type: 'string' },
          description: { type: 'string' },
          color: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
      SubCategory: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          categoryId: { type: 'string' },
          order: { type: 'number' },
          isActive: { type: 'boolean' },
        },
      },
      Service: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          basePrice: { type: 'number' },
          category: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          bookingId: { type: 'string' },
          clientId: { type: 'string' },
          providerId: { type: 'string' },
          rating: { type: 'number' },
          comment: { type: 'string' },
        },
      },
      Warranty: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          bookingId: { type: 'string' },
          clientId: { type: 'string' },
          status: { type: 'string' },
          issueDetails: { type: 'string' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          toUserId: { type: 'string' },
          type: { type: 'string' },
          payload: { type: 'object' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    // ==================== AUTH ====================
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register (step 1 – send OTP)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'role', 'phone'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['client', 'provider', 'admin'] },
                  phone: { type: 'string' },
                  profile: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'OTP sent to phone', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, userId: { type: 'string' }, phone: { type: 'string' }, requiresVerification: { type: 'boolean' } } } } } },
          400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Phone/email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/register/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP and complete registration',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'phone', 'code'],
                properties: {
                  userId: { type: 'string' },
                  phone: { type: 'string' },
                  code: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration complete', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } },
          400: { description: 'Invalid OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login (step 1 – send OTP)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone'],
                properties: { phone: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'OTP sent', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, phone: { type: 'string' }, requiresVerification: { type: 'boolean' }, userId: { type: 'string' } } } } } },
          400: { description: 'Phone required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP and login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'code'],
                properties: {
                  phone: { type: 'string' },
                  code: { type: 'string' },
                  userId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login success', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } },
          400: { description: 'Invalid OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/resend-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Resend OTP',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { phone: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'OTP sent', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          400: { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Forgot password – send reset email',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'If email exists, reset link sent' },
          400: { description: 'Email required' },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password with token',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset successful' },
          400: { description: 'Invalid or expired token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Auth'],
        summary: 'Update profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  bio: { type: 'string' },
                  avatar: { type: 'string' },
                  address: { type: 'object' },
                  companyName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change password (authenticated)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed' },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized / wrong password', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/account': {
      delete: {
        tags: ['Auth'],
        summary: 'Permanently delete account (client/provider only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Account deleted' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Only clients and providers can delete', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/addresses': {
      get: {
        tags: ['Auth'],
        summary: 'List saved addresses',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of addresses', content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { $ref: '#/components/schemas/SavedAddress' } } } } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Auth'],
        summary: 'Add saved address',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['line1', 'city', 'state', 'pincode'],
                properties: {
                  label: { type: 'string' },
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  line1: { type: 'string' },
                  addressLine: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  pincode: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Address added', content: { 'application/json': { schema: { $ref: '#/components/schemas/SavedAddress' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/addresses/{id}': {
      put: {
        tags: ['Auth'],
        summary: 'Update saved address',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  line1: { type: 'string' },
                  addressLine: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  pincode: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Address updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SavedAddress' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Address not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Auth'],
        summary: 'Delete saved address',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Address deleted' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Address not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/upload-avatar': {
      post: {
        tags: ['Auth'],
        summary: 'Upload avatar image',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { avatar: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Avatar URL', content: { 'application/json': { schema: { type: 'object', properties: { avatar: { type: 'string' }, url: { type: 'string' } } } } } },
          400: { description: 'No file uploaded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          503: { description: 'Upload not configured', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Upload failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ==================== BOOKINGS ====================
    '/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'List bookings (role-based)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated bookings', content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { $ref: '#/components/schemas/Booking' } }, page: { type: 'integer' } } } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create booking (client)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['serviceId', 'slot', 'address', 'price'],
                properties: {
                  serviceId: { type: 'string' },
                  slot: { type: 'object' },
                  address: { type: 'object' },
                  price: { type: 'number' },
                  paymentMethod: { type: 'string', enum: ['POD', 'ONLINE'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Booking created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get booking by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Booking', content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/bookings/{id}/assign': {
      post: {
        tags: ['Bookings'],
        summary: 'Assign provider to booking (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['providerId'],
                properties: { providerId: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Provider assigned', content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } } },
          400: { description: 'Invalid state', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/bookings/{id}/accept': {
      post: {
        tags: ['Bookings'],
        summary: 'Accept booking (provider)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Booking accepted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } } },
          400: { description: 'Invalid state', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/bookings/{id}/reject': {
      post: {
        tags: ['Bookings'],
        summary: 'Reject booking (provider)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { reason: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Booking rejected' },
          404: { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/bookings/{id}/cancel': {
      post: {
        tags: ['Bookings'],
        summary: 'Cancel booking (client/provider)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { reason: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Booking cancelled' },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/bookings/{id}/in_progress': {
      post: {
        tags: ['Bookings'],
        summary: 'Mark booking in progress (provider)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Status updated' },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/bookings/{id}/complete': {
      post: {
        tags: ['Bookings'],
        summary: 'Mark booking complete (provider)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { warrantySlip: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Booking completed' },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/bookings/{id}/warranty-slip': {
      post: {
        tags: ['Bookings'],
        summary: 'Upload warranty slip (provider)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { file: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Warranty slip URL' },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/bookings/{id}/extra-services': {
      post: {
        tags: ['Bookings'],
        summary: 'Add extra service at client site (provider)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['serviceId'],
                properties: {
                  serviceId: { type: 'string' },
                  price: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Extra service added', content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } } },
          400: { description: 'serviceId required / invalid state', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Booking or service not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/bookings/{id}/extra-services/confirm': {
      post: {
        tags: ['Bookings'],
        summary: 'Confirm extra services (client)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Extra services confirmed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } } },
          400: { description: 'No pending extra services', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ==================== CATEGORIES ====================
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'Paginated categories', content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { $ref: '#/components/schemas/Category' } }, total: { type: 'integer' }, page: { type: 'integer' } } } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  icon: { type: 'string' },
                  description: { type: 'string' },
                  color: { type: 'string' },
                  isActive: { type: 'boolean' },
                  order: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Category created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          400: { description: 'Duplicate name/slug', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/categories/by-slug/{slug}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Category', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/categories/by-slug/{slug}/subcategories': {
      get: {
        tags: ['Categories'],
        summary: 'List subcategories by category slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Subcategories and category', content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { $ref: '#/components/schemas/SubCategory' } }, category: { $ref: '#/components/schemas/Category' } } } } } },
          404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Category', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Categories'],
        summary: 'Update category (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  icon: { type: 'string' },
                  description: { type: 'string' },
                  color: { type: 'string' },
                  isActive: { type: 'boolean' },
                  order: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Category updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          400: { description: 'Duplicate name/slug', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete category (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Category deleted' },
          404: { description: 'Category not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ==================== SUBCATEGORIES ====================
    '/subcategories': {
      get: {
        tags: ['Subcategories'],
        summary: 'List subcategories by category',
        parameters: [{ name: 'categoryId', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'List of subcategories', content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { $ref: '#/components/schemas/SubCategory' } } } } } } },
          400: { description: 'categoryId required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Subcategories'],
        summary: 'Create subcategory (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['categoryId', 'name'],
                properties: {
                  categoryId: { type: 'string' },
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  order: { type: 'integer' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Subcategory created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SubCategory' } } } },
          400: { description: 'Validation / duplicate slug', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/subcategories/{id}': {
      put: {
        tags: ['Subcategories'],
        summary: 'Update subcategory (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  order: { type: 'integer' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Subcategory updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SubCategory' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Subcategory not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Subcategories'],
        summary: 'Delete subcategory (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Subcategory deleted' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Subcategory not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ==================== SERVICES ====================
    '/services': {
      get: {
        tags: ['Services'],
        summary: 'List services',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search text' },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'subCategory', in: 'query', schema: { type: 'string' }, description: 'Subcategory slug' },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Paginated services', content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { $ref: '#/components/schemas/Service' } }, page: { type: 'integer' } } } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Services'],
        summary: 'Create service (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string' },
                  basePrice: { type: 'number' },
                  category: { type: 'string' },
                  subCategoryId: { type: 'string' },
                  image: { type: 'string' },
                  images: { type: 'array', items: { type: 'string' } },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Service created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Service' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/services/{id}': {
      get: {
        tags: ['Services'],
        summary: 'Get service by ID or slug',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Service', content: { 'application/json': { schema: { $ref: '#/components/schemas/Service' } } } },
          404: { description: 'Service not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Services'],
        summary: 'Update service (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  basePrice: { type: 'number' },
                  category: { type: 'string' },
                  subCategoryId: { type: 'string' },
                  image: { type: 'string' },
                  images: { type: 'array', items: { type: 'string' } },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Service updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Service' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Service not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Services'],
        summary: 'Delete service (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Service deleted' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Service not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ==================== REVIEWS ====================
    '/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'List reviews',
        parameters: [
          { name: 'bookingId', in: 'query', schema: { type: 'string' } },
          { name: 'serviceId', in: 'query', schema: { type: 'string' } },
          { name: 'providerId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Paginated reviews', content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { $ref: '#/components/schemas/Review' } } } } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Reviews'],
        summary: 'Create review (client)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bookingId', 'rating'],
                properties: {
                  bookingId: { type: 'string' },
                  rating: { type: 'number' },
                  title: { type: 'string' },
                  comment: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Review created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Review' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/reviews/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get review by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Review', content: { 'application/json': { schema: { $ref: '#/components/schemas/Review' } } } },
          404: { description: 'Review not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Reviews'],
        summary: 'Update review (client)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rating: { type: 'number' },
                  title: { type: 'string' },
                  comment: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Review updated' },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Review not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/reviews/{id}/approve': {
      patch: {
        tags: ['Reviews'],
        summary: 'Approve review (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Review approved' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Review not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/reviews/{id}/reject': {
      delete: {
        tags: ['Reviews'],
        summary: 'Reject review (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Review rejected' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Review not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ==================== WARRANTY ====================
    '/warranty': {
      get: {
        tags: ['Warranty'],
        summary: 'List all warranties (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }],
        responses: {
          200: { description: 'List of warranties', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Warranty' } } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Warranty'],
        summary: 'Create warranty claim (client)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['bookingId', 'issueDetails'],
                properties: {
                  bookingId: { type: 'string' },
                  issueDetails: { type: 'string' },
                  attachments: { type: 'array', items: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Warranty created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Warranty' } } } },
          400: { description: 'Validation / warranty expired', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/warranty/client': {
      get: {
        tags: ['Warranty'],
        summary: 'List client warranties',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Client warranties', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Warranty' } } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/warranty/agent': {
      get: {
        tags: ['Warranty'],
        summary: 'List warranties for assigned agent (provider)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Agent warranties', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Warranty' } } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/warranty/{id}/admin': {
      patch: {
        tags: ['Warranty'],
        summary: 'Admin update warranty (assign, resolve, reject)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  action: { type: 'string', enum: ['assign', 'resolve', 'reject'] },
                  assignedAgentId: { type: 'string' },
                  adminNotes: { type: 'string' },
                  resolutionNotes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Warranty updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Warranty' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Warranty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/warranty/{id}/agent': {
      patch: {
        tags: ['Warranty'],
        summary: 'Agent update warranty (provider)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  resolutionNotes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Warranty updated' },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Warranty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ==================== NOTIFICATIONS ====================
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get current user notifications',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of notifications', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/notifications/read-all': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All marked as read' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/notifications/{id}/read': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Notification updated' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Notification not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete notification',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Notification deleted' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Notification not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ==================== ADMIN ====================
    '/admin/providers': {
      post: {
        tags: ['Admin'],
        summary: 'Onboard provider',
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          201: { description: 'Provider onboarded' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/assign-provider': {
      post: {
        tags: ['Admin'],
        summary: 'Assign provider to service',
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          200: { description: 'Provider assigned' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/bookings': {
      get: {
        tags: ['Admin'],
        summary: 'List all bookings',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All bookings' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/pending-requests': {
      get: {
        tags: ['Admin'],
        summary: 'Get pending booking requests',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Pending requests' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/warranty-claims': {
      get: {
        tags: ['Admin'],
        summary: 'List warranty claims',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Warranty claims' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/service-agents': {
      get: {
        tags: ['Admin'],
        summary: 'List service agents',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Service agents' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/warranty/{id}': {
      post: {
        tags: ['Admin'],
        summary: 'Approve/update warranty',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          200: { description: 'Warranty updated' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Warranty not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/review/{id}': {
      post: {
        tags: ['Admin'],
        summary: 'Moderate review',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          200: { description: 'Review moderated' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Review not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/analytics': {
      get: {
        tags: ['Admin'],
        summary: 'Get analytics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Analytics data' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: { description: 'List of users' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/admin/users/{id}/status': {
      patch: {
        tags: ['Admin'],
        summary: 'Toggle user status (active/inactive)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { isActive: { type: 'boolean' } } } } } },
        responses: {
          200: { description: 'User status updated' },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};