 const Booking = require('../models/booking.model');
const Service = require('../models/service.model');
const Notification = require('../models/notification.model');
const BookingService = require('../services/booking.service');

// client creates booking
async function createBooking(req, res) {
  const clientId = req.user._id;
  const { serviceId, slot, address, price, paymentMethod = 'POD' } = req.body;

  console.log('Creating booking with address:', JSON.stringify(address, null, 2));

  // Create booking as pending - admin will assign agent
  const bookingData = { 
    clientId, 
    serviceId, 
    slot, 
    address, 
    price, 
    paymentMethod,
    status: 'pending' // Booking starts as pending
  };
  const booking = await Booking.create(bookingData);

  console.log('Booking created with address:', JSON.stringify(booking.address, null, 2));

  // Notify client
  await Notification.create({
    toUserId: clientId,
    type: 'booking_confirmation',
    channel: 'email',
    payload: { bookingId: booking._id, message: 'Booking request submitted successfully' }
  });

  res.status(201).json(booking);
}

// provider: accept booking
async function acceptBooking(req, res) {
  const providerId = req.user._id;
  const { id } = req.params;
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.status !== 'pending') return res.status(400).json({ message: 'Invalid state' });

  booking.providerId = providerId;
  booking.status = 'accepted';
  await booking.save();

  await Notification.create({
    toUserId: booking.clientId,
    type: 'booking_accepted',
    channel: 'email',
    payload: { bookingId: booking._id, message: 'Provider accepted your booking' }
  });

  res.json(booking);
}

// provider: reject booking
async function rejectBooking(req, res) {
  const providerId = req.user._id;
  const { id } = req.params;
  const { reason } = req.body;
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  booking.status = 'rejected';
  booking.cancelReason = reason || 'Rejected by provider';
  await booking.save();

  await Notification.create({
    toUserId: booking.clientId,
    type: 'booking_rejected',
    channel: 'email',
    payload: { bookingId: booking._id, message: 'Provider rejected your booking', reason }
  });

  // optionally notify admin (audit)
  res.json(booking);
}

// client or provider can cancel before service time
async function cancelBooking(req, res) {
  const user = req.user;
  const { id } = req.params;
  const { reason } = req.body;
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  // only client or assigned provider or admin can cancel
  if (String(booking.clientId) !== String(user._id) && String(booking.providerId) !== String(user._id) && user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  booking.status = 'cancelled';
  booking.cancelReason = reason || 'Cancelled by user';
  await booking.save();

  await Notification.create({
    toUserId: booking.providerId || user._id,
    type: 'booking_cancelled',
    channel: 'email',
    payload: { bookingId: booking._id, message: 'Booking cancelled', reason }
  });

  res.json(booking);
}

async function markInProgress(req, res) {
  const providerId = req.user._id;
  const { id } = req.params;
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.providerId) !== String(providerId)) return res.status(403).json({ message: 'Forbidden' });

  booking.status = 'in_progress';
  await booking.save();

  res.json(booking);
}

async function completeBooking(req, res) {
  const providerId = req.user._id;
  const { id } = req.params;
  const { warrantySlip } = req.body; // URL to warranty slip uploaded by agent
  
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.providerId) !== String(providerId)) return res.status(403).json({ message: 'Forbidden' });

  const completionTime = new Date();
  const warrantyExpiry = new Date(completionTime);
  warrantyExpiry.setDate(warrantyExpiry.getDate() + 14); // 14-day warranty

  booking.status = 'completed';
  booking.completedAt = completionTime;
  booking.warrantyExpiresAt = warrantyExpiry;
  if (warrantySlip) booking.warrantySlip = warrantySlip;
  await booking.save();

  await Notification.create({
    toUserId: booking.clientId,
    type: 'booking_completed',
    channel: 'email',
    payload: { bookingId: booking._id, message: 'Service marked as completed' }
  });

  res.json(booking);
}

// list bookings - role based
async function listBookings(req, res) {
  const user = req.user;
  const { page = 1, limit = 20, status } = req.query;
  const filter = {};

  if (user.role === 'client') filter.clientId = user._id;
  if (user.role === 'provider') filter.providerId = user._id;
  if (user.role === 'admin' && req.query.userId) filter.clientId = req.query.userId;

  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const items = await Booking.find(filter)
    .populate('serviceId', 'title category basePrice image images')
    .populate('clientId', 'name email phone avatar')
    .populate('providerId', 'name email phone companyName avatar')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  res.json({ items, page: Number(page) });
}

// get single booking
async function getBooking(req, res) {
  const { id } = req.params;
  const booking = await Booking.findById(id)
    .populate('serviceId')
    .populate('clientId', 'name email phone avatar')
    .populate('providerId', 'name email phone companyName avatar');
  
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  
  // check access - only client, provider, or admin can view
  const user = req.user;
  const isClient = booking.clientId && String(booking.clientId._id) === String(user._id);
  const isProvider = booking.providerId && String(booking.providerId._id) === String(user._id);
  if (user.role !== 'admin' && !isClient && !isProvider) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json(booking);
}

// admin assigns provider to booking
async function assignProvider(req, res) {
  const { id } = req.params;
  const { providerId } = req.body;
  
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  
  // Prevent assigning provider to cancelled, rejected, or completed bookings
  if (['cancelled', 'rejected', 'completed', 'warranty_requested', 'warranty_claimed'].includes(booking.status)) {
    return res.status(400).json({ message: `Cannot assign provider to ${booking.status} booking` });
  }
  
  booking.providerId = providerId;
  booking.status = 'accepted';
  await booking.save();
  
  await Notification.create({
    toUserId: booking.clientId,
    type: 'booking_accepted',
    channel: 'email',
    payload: { bookingId: booking._id, message: 'Admin assigned provider to your booking' }
  });
  
  await Notification.create({
    toUserId: providerId,
    type: 'booking_assigned',
    channel: 'email',
    payload: { bookingId: booking._id, message: 'You have been assigned a new booking' }
  });
  
  res.json(booking);
}

// Upload warranty slip (to Cloudinary)
async function uploadWarrantySlip(req, res) {
  const providerId = req.user._id;
  const { id } = req.params;
  const { uploadFromBuffer, isConfigured } = require('../utils/cloudinary');

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ message: 'Upload not configured. Set CLOUDINARY_* in .env' });
  }

  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.providerId) !== String(providerId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';
  const result = await uploadFromBuffer(req.file.buffer, 'urban-care/warranty-slips', resourceType);
  booking.warrantySlip = result.secure_url;
  await booking.save();

  res.json({ warrantySlip: booking.warrantySlip, message: 'Warranty slip uploaded successfully' });
}

// Provider: add extra service at client site (when status is accepted or in_progress)
async function addExtraService(req, res) {
  const providerId = req.user._id;
  const { id } = req.params;
  const { serviceId, price } = req.body;

  if (!serviceId) {
    return res.status(400).json({ message: 'serviceId is required' });
  }

  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.providerId) !== String(providerId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (!['accepted', 'in_progress'].includes(booking.status)) {
    return res.status(400).json({ message: 'Can add extra services only when booking is accepted or in progress' });
  }

  const service = await Service.findById(serviceId).select('title basePrice');
  if (!service) return res.status(404).json({ message: 'Service not found' });

  const amount = price != null ? Number(price) : (service.basePrice || 0);
  if (!booking.extraServices) booking.extraServices = [];
  booking.extraServices.push({
    serviceId,
    title: service.title,
    price: amount,
    status: 'pending',
    addedAt: new Date()
  });
  await booking.save();

  await Notification.create({
    toUserId: booking.clientId,
    type: 'extra_services_added',
    channel: 'email',
    payload: { bookingId: booking._id, message: 'Provider has added extra service(s). Please confirm in your booking details.' }
  });

  const updated = await Booking.findById(id)
    .populate('serviceId')
    .populate('clientId', 'name email phone avatar')
    .populate('providerId', 'name email phone companyName avatar');
  res.json(updated);
}

// Client: confirm all pending extra services
async function confirmExtraServices(req, res) {
  const clientId = req.user._id;
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.clientId) !== String(clientId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const pending = (booking.extraServices || []).filter(e => e.status === 'pending');
  if (pending.length === 0) {
    return res.status(400).json({ message: 'No pending extra services to confirm' });
  }

  for (const ext of booking.extraServices) {
    if (ext.status === 'pending') ext.status = 'confirmed';
  }
  await booking.save();

  // Notify admin so they can see provider did these extra services for this client
  const User = require('../models/user.model');
  const adminUsers = await User.find({ role: 'admin' }).select('_id');
  for (const admin of adminUsers) {
    await Notification.create({
      toUserId: admin._id,
      type: 'extra_services_confirmed',
      channel: 'email',
      payload: {
        bookingId: booking._id,
        message: `Client confirmed extra services for booking #${String(booking._id).slice(-8)}. Check booking for details.`,
        extraServices: pending.map(e => ({ title: e.title, price: e.price }))
      }
    });
  }

  const updated = await Booking.findById(id)
    .populate('serviceId')
    .populate('clientId', 'name email phone avatar')
    .populate('providerId', 'name email phone companyName avatar');
  res.json(updated);
}

module.exports = {
  createBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  markInProgress,
  completeBooking,
  listBookings,
  getBooking,
  assignProvider,
  uploadWarrantySlip,
  addExtraService,
  confirmExtraServices
};
