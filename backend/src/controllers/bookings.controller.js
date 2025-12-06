 const Booking = require('../models/booking.model');
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
  if (user.role !== 'admin' && 
      String(booking.clientId._id) !== String(user._id) && 
      booking.providerId && String(booking.providerId._id) !== String(user._id)) {
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

// Upload warranty slip
async function uploadWarrantySlip(req, res) {
  const providerId = req.user._id;
  const { id } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.providerId) !== String(providerId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  // Store the file path (relative URL)
  booking.warrantySlip = `/uploads/warranty-slips/${req.file.filename}`;
  await booking.save();
  
  res.json({ warrantySlip: booking.warrantySlip, message: 'Warranty slip uploaded successfully' });
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
  uploadWarrantySlip
};
