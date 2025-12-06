 // src/services/booking.service.js
const Booking = require('../models/booking.model');
const BookingModel = Booking; // alias

/**
 * Checks if provider has conflicting booking on same slot
 * Simple check by exact date + time overlap; you can extend to capacity-based slots.
 */
async function providerHasConflict(providerId, slot) {
  if (!providerId) return false;
  const start = slot.startTime || null;
  const end = slot.endTime || null;
  // simple: check same date with any non-cancelled booking for provider
  const existing = await Booking.findOne({
    providerId,
    'slot.date': slot.date,
    status: { $nin: ['cancelled','rejected'] }
  }).lean();
  // for now, if any booking exists for same date we say conflict — replace with time overlap logic if needed.
  return !!existing;
}

/**
 * Create booking. Optionally providerId assigned by admin/client.
 */
async function createBooking({ clientId, serviceId, slot, address, price, providerId = null }) {
  if (!clientId || !serviceId || !slot || !slot.date) throw new Error('Missing booking required fields');

  if (providerId) {
    const conflict = await providerHasConflict(providerId, slot);
    if (conflict) throw new Error('Provider not available for chosen slot');
  }
  const b = await BookingModel.create({ clientId, serviceId, slot, address, price, providerId, status: 'pending' });
  return b;
}

/**
 * Assign a provider to pending booking (admin action or provider accept)
 */
async function assignProvider(bookingId, providerId) {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new Error('Booking not found');
  if (booking.status !== 'pending' && booking.status !== 'rejected') throw new Error('Booking state does not allow assign');

  const conflict = await providerHasConflict(providerId, booking.slot);
  if (conflict) throw new Error('Provider not available');

  booking.providerId = providerId;
  booking.status = 'accepted';
  await booking.save();
  return booking;
}

/**
 * Mark completed
 */
async function completeBooking(bookingId, providerId) {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new Error('Booking not found');
  if (String(booking.providerId) !== String(providerId)) throw new Error('Forbidden');
  booking.status = 'completed';
  await booking.save();
  return booking;
}

/**
 * Cancel
 */
async function cancelBooking(bookingId, userId, reason = 'Cancelled') {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new Error('Booking not found');
  // user must be client/provider/admin check done in controller; here we just set
  booking.status = 'cancelled';
  booking.cancelReason = reason;
  await booking.save();
  return booking;
}

module.exports = {
  createBooking,
  assignProvider,
  providerHasConflict,
  completeBooking,
  cancelBooking
};
