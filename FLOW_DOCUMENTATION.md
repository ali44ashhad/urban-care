# Urban Clap - Complete Application Flows

## 🎯 CLIENT FLOW

### Step 1: Register/Login
- **Route:** `/auth/register` or `/auth/login`
- **Features:**
  - Email & password authentication
  - JWT token stored in cookies (30-day expiry)
  - Auto-redirect based on role
  - Client role automatically assigned on registration

### Step 2: Browse Services
- **Route:** `/` (Landing page) → `/services/:category`
- **Features:**
  - 6 service categories displayed (AC, Plumbing, Electrician, Salon, Cleaning, Painting)
  - Category-based service filtering
  - Service cards with pricing options
  - Search and filter capabilities

### Step 3: Book Service
- **Route:** Click "Book Now" on any service
- **Action:** Service saved to sessionStorage
- **Redirect:** `/client/booking/pick`
- **Features:**
  - Service details displayed
  - Pricing options selection
  - Quantity/variant selection

### Step 4: Choose Slot
- **Route:** `/client/booking/select-slot`
- **Features:**
  - Date picker (next 30 days)
  - Time slot selection (9 AM - 9 PM)
  - Visual slot availability
  - Selected slot highlighted

### Step 5: Enter Address
- **Route:** `/client/booking/address`
- **Features:**
  - Name and phone auto-filled from profile
  - Complete address form (line, city, state, pincode)
  - Address validation
  - Data saved to booking draft

### Step 6: Payment
- **Route:** `/client/booking/payment`
- **Features:**
  - Order summary displayed
  - Service, slot, address review
  - Pay on service option
  - Final booking creation

### Step 7: Confirmation
- **Route:** `/client/booking/confirmation?bookingId=xxx`
- **Features:**
  - Booking confirmed message
  - Booking ID displayed
  - Provider auto-assigned
  - Status: "accepted" (no admin approval needed)
  - Link to view booking details

### Step 8: Service Completion
- **Status Update:** Provider marks as "completed"
- **Notification:** Client receives update
- **Access:** `/client/bookings/:id`

### Step 9: Review & Warranty
- **Route:** `/client/bookings/:id`
- **Features:**
  - ✅ **Write Review** (only for completed bookings)
    - 5-star rating system
    - Text review submission
    - Submitted to admin for approval
  - ✅ **Request Warranty** (only for completed bookings)
    - Issue description form
    - Photo upload support
    - Warranty tracking
  - **Cancel Booking** (before completion)

---

## 🛠️ PROVIDER FLOW

### Step 1: Login
- **Route:** `/auth/login`
- **Credentials:** Provider email & password
- **Redirect:** `/provider` (Dashboard)

### Step 2: View Bookings
- **Route:** `/provider/bookings`
- **Features:**
  - List of all assigned bookings
  - Filter by status (pending, accepted, in_progress, completed)
  - Booking details: service, client, date, time, address
  - Status badges with color coding

### Step 3: Accept/Reject Bookings
- **Actions:**
  - ✅ **Accept:** Changes status to "accepted"
  - ❌ **Reject:** Provide rejection reason, notify client and admin
- **Auto-assigned:** Bookings come pre-assigned (no manual assignment needed)

### Step 4: Execute Service
- **Status:** "in_progress"
- **Action:** Provider marks booking as "in progress" when starting work
- **Client Details Visible:**
  - Name, phone number
  - Complete address with directions
  - Time slot
  - Special instructions

### Step 5: Mark Completed
- **Action:** Click "Mark Completed" button
- **Status:** Changes to "completed"
- **Result:**
  - Client notified
  - Payment status updated
  - Opens review & warranty options for client

### Step 6: View Reviews
- **Route:** `/provider/profile`
- **Features:**
  - Average rating display
  - Rating distribution (5★ to 1★)
  - Individual review cards with:
    - Client name
    - Star rating
    - Review text
    - Date posted
    - Associated booking

---

## 👨‍💼 ADMIN FLOW

### Step 1: Login
- **Route:** `/auth/login`
- **Credentials:** Admin email & password
- **Redirect:** `/admin` (Dashboard)

### Step 2: Add Services
- **Route:** `/admin/services`
- **Features:**
  - ✅ Create new service
  - ✅ Edit existing services
  - ✅ Delete services
  - ✅ Set pricing & categories
  - ✅ Upload service images
  - ✅ Activate/deactivate services

### Step 3: Onboard Providers
- **Route:** `/admin/providers`
- **Features:**
  - ✅ Add new provider manually
  - ✅ Set provider details (name, email, company, phone)
  - ✅ Generate temporary password
  - ✅ Provider profile creation
  - ✅ Contact information management

### Step 4: Assign Providers to Services
- **Route:** `/admin/providers`
- **Features:**
  - ✅ Link providers to service categories
  - ✅ Multi-service assignment
  - ✅ View assigned services per provider
  - **Auto-assignment:** System automatically assigns bookings to providers based on service category

### Step 5: Manage Bookings
- **Route:** `/admin/bookings`
- **Features:**
  - ✅ View all bookings (ongoing, completed, cancelled)
  - ✅ Filter by status (all, pending, accepted, in_progress, completed, cancelled)
  - ✅ Search by service, client, provider, booking ID
  - ✅ Manually assign/reassign providers
  - ✅ Cancel bookings with reason
  - ✅ View complete booking details:
    - Service name
    - Client information
    - Provider details
    - Date, time, address
    - Payment amount
    - Status with color badges

### Step 6: Approve Warranty Claims
- **Route:** `/admin/warranty`
- **Features:**
  - ✅ View all warranty requests
  - ✅ See issue descriptions & photos
  - ✅ Approve warranty claims
  - ✅ Reject with reason
  - ✅ Assign to providers for resolution
  - ✅ Track warranty status (pending, approved, rejected, resolved)

### Step 7: Approve/Manage Ratings
- **Route:** `/admin/reviews`
- **Features:**
  - ✅ View all submitted reviews
  - ✅ Approve reviews for public display
  - ✅ Remove inappropriate reviews
  - ✅ Filter by provider, service, rating
  - ✅ View review details:
    - Client name
    - Provider name
    - Service name
    - Star rating
    - Review text
    - Submission date

---

## 📊 ADDITIONAL ADMIN FEATURES

### Analytics Dashboard
- **Route:** `/admin/analytics`
- **Features:**
  - Total bookings count
  - Revenue calculation (completed bookings)
  - Average rating across platform
  - Status breakdown charts
  - Time range filters (7d, 30d, 90d)

### User Management
- **Route:** `/admin/users`
- **Features:**
  - View all users (clients & providers)
  - Filter by role
  - Search by name, email, phone, company
  - Activate/deactivate user accounts
  - View user details and activity

---

## 🔄 AUTOMATIC FEATURES

1. **Auto Provider Assignment:**
   - When client books, system finds provider who offers that service
   - Booking status automatically set to "accepted"
   - No manual admin approval needed

2. **Email Notifications:**
   - Booking confirmations
   - Status updates
   - Warranty approvals
   - Review submissions

3. **Real-time Updates:**
   - Toast notifications for actions
   - Live status changes
   - Instant UI updates

---

## 📱 RESPONSIVE DESIGN

All flows work seamlessly on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

---

## 🔐 SECURITY FEATURES

- JWT authentication with 30-day cookie expiry
- Role-based access control (Client, Provider, Admin)
- Password hashing with bcrypt
- Protected routes with middleware
- Input validation on all forms
- File upload size limits (5MB)

---

## ✅ IMPLEMENTATION STATUS

| Feature | Client | Provider | Admin | Status |
|---------|--------|----------|-------|--------|
| Authentication | ✅ | ✅ | ✅ | Complete |
| Service Browsing | ✅ | - | ✅ | Complete |
| Booking Flow | ✅ | ✅ | ✅ | Complete |
| Reviews | ✅ | ✅ | ✅ | Complete |
| Warranty | ✅ | ✅ | ✅ | Complete |
| Analytics | - | - | ✅ | Complete |
| User Management | - | - | ✅ | Complete |
| Email Notifications | ⚠️ | ⚠️ | ⚠️ | Needs SMTP |

**Legend:**
- ✅ Fully Implemented
- ⚠️ Partially Implemented (needs configuration)
- ❌ Not Implemented

---

## 🚀 GETTING STARTED

### Client Flow Start:
1. Visit `/auth/register`
2. Create account
3. Browse services on homepage
4. Book your first service!

### Provider Flow Start:
1. Admin onboards you at `/admin/providers`
2. Login at `/auth/login`
3. View assigned bookings at `/provider/bookings`

### Admin Flow Start:
1. Login at `/auth/login`
2. Access admin dashboard at `/admin`
3. Manage entire platform!

---

**Last Updated:** December 2, 2025
**Documentation Version:** 1.0
**Platform Status:** Production Ready 🎉
