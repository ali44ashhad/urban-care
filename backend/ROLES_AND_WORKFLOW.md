# Roles and Workflow - Urban Clap Service Booking System

## 📋 User Roles

### 1. **Client (Customer)**
- Role: `'client'`
- Books services (AC repair, etc.)
- Can view and manage their bookings
- Can submit warranty claims within 14 days of service completion
- Payment: POD (Pay on Delivery) by default

### 2. **Provider (Service Agent/Technician)**
- Role: `'provider'`
- AC repair technician who performs the actual work
- Stored in **User model** with `role='provider'`
- Assigned to bookings by Admin
- Responsibilities:
  - Accept/Reject assigned bookings
  - Update booking status (in_progress → completed)
  - Upload warranty slip after job completion
  - Handle warranty claims assigned by admin

### 3. **Admin**
- Role: `'admin'`
- Manages entire platform
- Responsibilities:
  - View pending bookings
  - Assign service agents (providers) to bookings
  - Manage warranty claims
  - Onboard new service agents
  - View analytics and reports

---

## 🔄 Complete Booking Workflow

### Step 1: Customer Books Service
```javascript
// Client creates booking
POST /api/v1/bookings
{
  serviceId: "...",
  slot: { date, startTime, endTime },
  address: { ... }
}

// Booking created with:
status: 'pending'
providerId: null  // No agent assigned yet
paymentMethod: 'POD'
```

### Step 2: Admin Assigns Service Agent
```javascript
// Admin views pending requests
GET /api/v1/admin/pending-requests

// Admin assigns provider (service agent)
PUT /api/v1/bookings/:id/assign-provider
{
  providerId: "USER_ID_WITH_ROLE_PROVIDER"
}

// Booking updated:
status: 'pending' (or 'accepted' depending on implementation)
providerId: "60f7b3c..."  // Service agent assigned
```

### Step 3: Provider Accepts & Completes Work
```javascript
// Provider accepts booking
PUT /api/v1/bookings/:id/accept
status: 'accepted' → 'in_progress'

// Provider marks as complete
PUT /api/v1/bookings/:id/complete
status: 'in_progress' → 'completed'
completedAt: Date.now()
warrantyExpiresAt: completedAt + 14 days
```

### Step 4: Provider Uploads Warranty Slip
```javascript
// Provider uploads warranty document
POST /api/v1/bookings/:id/warranty-slip
Content-Type: multipart/form-data
File: warranty_slip.pdf or .jpg

// Booking updated:
warrantySlip: "/uploads/warranty-slips/abc123.pdf"
```

### Step 5: Customer Claims Warranty (if needed)
```javascript
// Customer submits warranty claim (within 14 days)
POST /api/v1/warranty
{
  bookingId: "...",
  description: "AC not cooling properly",
  images: [...]
}

// Validation: currentDate <= booking.warrantyExpiresAt
// Warranty created with status: 'pending'
```

### Step 6: Admin Assigns Warranty to Agent
```javascript
// Admin views warranty claims
GET /api/v1/admin/warranty-claims

// Admin assigns to service agent
PUT /api/v1/warranty/:id/admin
{
  assignedAgentId: "PROVIDER_USER_ID",
  status: 'assigned'
}
```

### Step 7: Agent Resolves Warranty
```javascript
// Agent updates warranty claim
PUT /api/v1/warranty/:id/agent
{
  status: 'in_progress', // or 'resolved'
  resolutionNotes: "Replaced faulty part, AC working fine now"
}
```

---

## 🗂️ Database Structure

### User Collection
```javascript
{
  _id: ObjectId,
  name: "Amit Kumar",
  email: "amit@example.com",
  role: "provider",  // or 'client', 'admin'
  phone: "9876543210",
  companyName: "Amit AC Services",  // For providers
  avatar: "/uploads/avatars/amit.jpg",
  address: { ... },
  isActive: true
}
```

### Booking Collection
```javascript
{
  _id: ObjectId,
  clientId: ObjectId → User(role='client'),
  providerId: ObjectId → User(role='provider'),  // Assigned by admin
  serviceId: ObjectId → Service,
  status: 'pending' | 'accepted' | 'in_progress' | 'completed',
  price: 799,
  slot: { date, startTime, endTime },
  address: { ... },
  paymentMethod: 'POD',
  warrantySlip: "/uploads/warranty-slips/abc.pdf",  // Set by provider
  completedAt: Date,
  warrantyExpiresAt: Date  // completedAt + 14 days
}
```

### Warranty Collection
```javascript
{
  _id: ObjectId,
  bookingId: ObjectId → Booking,
  clientId: ObjectId → User(role='client'),
  assignedAgentId: ObjectId → User(role='provider'),  // Assigned by admin
  description: "AC not cooling",
  images: [...],
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved',
  resolutionNotes: "Fixed issue...",
  resolvedAt: Date
}
```

---

## ❓ Common Questions

### Q: Provider model kya hai? Use kyu nahi ho raha?
**A:** Provider model ek separate table hai jo initially banaya tha, but **currently use nahi ho raha**. Sab provider information **User model** me hi store hai with `role='provider'`. Provider model ko reference ke liye rakha hai, but actual system User model se chal raha hai.

### Q: Admin kisko assign kare?
**A:** Admin booking ko **User (role='provider')** assign karta hai. Ye service agents/technicians hain jo actual kaam karte hain.

```javascript
// Service agents ko list karne ke liye:
GET /api/v1/admin/service-agents

// Response:
[
  {
    _id: "60f7b3c...",
    name: "Amit Kumar",
    email: "amit@provider.com",
    role: "provider",
    phone: "9876543210",
    companyName: "Amit AC Services"
  }
]
```

### Q: Warranty ka 14-day validation kaise hota hai?
**A:** Jab provider booking complete karta hai (`status→completed`), tab:
```javascript
booking.completedAt = new Date();
booking.warrantyExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
```

Jab customer warranty claim karta hai:
```javascript
if (currentDate > booking.warrantyExpiresAt) {
  throw new Error('Warranty period expired');
}
```

---

## 🎯 Location Restrictions

**Service Areas (Bangalore only):**
- Akshay Nagar
- JP Nagar

Booking creation time pe location validation:
```javascript
const allowedAreas = ['Akshay Nagar', 'JP Nagar'];
if (!allowedAreas.includes(booking.address.city)) {
  return res.status(400).json({ message: 'Service not available in this area' });
}
```

---

## 📊 Key APIs

### For Admin:
- `GET /api/v1/admin/pending-requests` - View bookings pending assignment
- `GET /api/v1/admin/service-agents` - List all providers for assignment
- `PUT /api/v1/bookings/:id/assign-provider` - Assign provider to booking
- `GET /api/v1/admin/warranty-claims` - View all warranty claims
- `PUT /api/v1/warranty/:id/admin` - Assign warranty to agent

### For Provider (Service Agent):
- `GET /api/v1/bookings/provider/:id` - View assigned bookings
- `PUT /api/v1/bookings/:id/accept` - Accept booking
- `PUT /api/v1/bookings/:id/complete` - Mark as completed
- `POST /api/v1/bookings/:id/warranty-slip` - Upload warranty document
- `GET /api/v1/warranty/agent/:providerId` - View assigned warranty claims
- `PUT /api/v1/warranty/:id/agent` - Update warranty status

### For Client:
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/client/:id` - View my bookings
- `POST /api/v1/warranty` - Submit warranty claim
- `GET /api/v1/warranty?clientId=...` - View my warranty claims

---

## 🔐 Authentication

All requests require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Token contains:
```javascript
{
  userId: "...",
  role: "client" | "provider" | "admin",
  email: "..."
}
```

Role-based access control in middleware:
```javascript
// Only admin can access
router.get('/admin/pending-requests', requireAuth, requireRole('admin'), ...);

// Only provider can access
router.put('/bookings/:id/complete', requireAuth, requireRole('provider'), ...);
```

---

**Summary:** Provider role = Service Agent jo User model me stored hai. Admin unhe bookings assign karta hai. Alag Provider model confusion create kar raha tha, isliye ab clearly documented hai ki actual system kaise kaam karta hai.
