 // src/controllers/warranty.controller.js
const Warranty = require('../models/warranty.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const NotificationService = require('../services/notification.service');

async function createWarranty(req, res) {
  const clientId = req.user._id;
  const { bookingId, issueDetails } = req.body;
  if (!bookingId || !issueDetails) return res.status(400).json({ message: 'bookingId and issueDetails required' });

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.clientId) !== String(clientId)) return res.status(403).json({ message: 'Forbidden' });
  if (booking.status !== 'completed') return res.status(400).json({ message: 'Warranty can be claimed only after completion' });

  // Validate 14-day warranty window
  const now = new Date();
  if (!booking.warrantyExpiresAt || now > booking.warrantyExpiresAt) {
    return res.status(400).json({ message: 'Warranty period (14 days) has expired' });
  }

  const w = await Warranty.create({
    bookingId,
    clientId,
    providerId: booking.providerId,
    issueDetails,
    status: 'pending'
  });

  // Upload attachments to Cloudinary if any
  if (req.files?.length) {
    const { uploadFromBuffer, isConfigured } = require('../utils/cloudinary');
    if (isConfigured()) {
      const urls = [];
      for (const file of req.files) {
        const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
        const result = await uploadFromBuffer(file.buffer, 'urban-care/warranty-attachments', resourceType);
        urls.push(result.secure_url);
      }
      w.attachmentUrls = urls;
      await w.save();
    }
  }

  // Update booking status
  booking.status = 'warranty_requested';
  booking.warrantyRequests.push(w._id);
  await booking.save();

  // Notify provider
  NotificationService.enqueue({
    toUserId: booking.providerId,
    type: 'warranty_request',
    channel: 'email',
    payload: { warrantyId: w._id, bookingId, message: 'New warranty request' }
  }).catch(err => console.error('Notification error:', err));

  // Notify all admins – new warranty claim (review/assign)
  const admins = await User.find({ role: 'admin' }).select('_id');
  for (const admin of admins) {
    await Notification.create({
      toUserId: admin._id,
      type: 'new_warranty_request',
      channel: 'email',
      payload: { warrantyId: w._id, bookingId, message: 'New warranty claim. Please review and assign.' }
    });
  }

  res.status(201).json(w);
}

// Admin sees all warranty requests
async function listAllWarranties(req, res) {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  
  const items = await Warranty.find(filter)
    .populate({
      path: 'bookingId',
      populate: { path: 'serviceId', select: 'title category price' }
    })
    .populate('clientId', 'name email phone')
    .populate('providerId', 'name email phone')
    .populate('assignedAgentId', 'name email phone')
    .sort({ createdAt: -1 });
  res.json(items);
}

async function listWarrantyForClient(req, res) {
  const clientId = req.user._id;
  const items = await Warranty.find({ clientId }).sort({ createdAt: -1 });
  res.json(items);
}

// admin actions: assign agent, approve, reject, resolve
async function adminUpdateWarranty(req, res) {
  const { id } = req.params;
  const { action, adminNotes, assignedAgentId } = req.body;
  const w = await Warranty.findById(id).populate('bookingId');
  if (!w) return res.status(404).json({ message: 'Warranty not found' });

  if (action === 'assign' && assignedAgentId) {
    w.assignedAgentId = assignedAgentId;
    w.status = 'assigned';
    
    // Notify assigned agent (don't await to avoid blocking)
    NotificationService.enqueue({
      toUserId: assignedAgentId,
      type: 'warranty_assigned',
      channel: 'email',
      payload: { warrantyId: w._id, message: 'You have been assigned a warranty claim' }
    }).catch(err => console.error('Notification error:', err));
  } else if (action === 'reject') {
    w.status = 'rejected';
    
    // Update booking status back to completed when rejected
    const booking = await Booking.findById(w.bookingId);
    if (booking && booking.status === 'warranty_requested') {
      booking.status = 'completed';
      await booking.save();
    }
  } else if (action === 'resolve') {
    w.status = 'resolved';
    w.resolvedAt = new Date();
    
    // Update booking status to warranty_claimed when resolved
    const booking = await Booking.findById(w.bookingId);
    if (booking && booking.status === 'warranty_requested') {
      booking.status = 'warranty_claimed';
      await booking.save();
    }
  } else {
    return res.status(400).json({ message: 'Invalid action' });
  }

  if (adminNotes) w.adminNotes = adminNotes;
  await w.save();

  // notify client (don't await to avoid blocking)
  NotificationService.enqueue({
    toUserId: w.clientId,
    type: `warranty_${w.status}`,
    channel: 'email',
    payload: { warrantyId: w._id, status: w.status, message: `Warranty ${w.status}` }
  }).catch(err => console.error('Notification error:', err));

  res.json(w);
}

// Agent updates warranty status and adds resolution notes
async function agentUpdateWarranty(req, res) {
  const agentId = req.user._id;
  const { id } = req.params;
  const { status, resolutionNotes } = req.body;

  const w = await Warranty.findById(id);
  if (!w) return res.status(404).json({ message: 'Warranty not found' });
  if (String(w.assignedAgentId) !== String(agentId)) {
    return res.status(403).json({ message: 'Forbidden - not assigned to you' });
  }

  if (status === 'in_progress') {
    w.status = 'in_progress';
  } else if (status === 'resolved') {
    w.status = 'resolved';
    w.resolvedAt = new Date();
    if (resolutionNotes) w.resolutionNotes = resolutionNotes;

    // Update booking status to warranty_claimed
    const booking = await Booking.findById(w.bookingId);
    if (booking && booking.status === 'warranty_requested') {
      booking.status = 'warranty_claimed';
      await booking.save();
    }

    // Notify client (don't await to avoid blocking)
    NotificationService.enqueue({
      toUserId: w.clientId,
      type: 'warranty_resolved',
      channel: 'email',
      payload: { warrantyId: w._id, message: 'Your warranty claim has been resolved' }
    }).catch(err => console.error('Notification error:', err));
  } else {
    return res.status(400).json({ message: 'Invalid status' });
  }

  await w.save();
  res.json(w);
}

// List warranties assigned to agent
async function listWarrantyForAgent(req, res) {
  const agentId = req.user._id;
  const { status } = req.query;
  const filter = { assignedAgentId: agentId };
  if (status) filter.status = status;
  
  const items = await Warranty.find(filter)
    .populate({
      path: 'bookingId',
      populate: { path: 'serviceId', select: 'title category price images image' }
    })
    .populate('clientId', 'name email phone')
    .sort({ createdAt: -1 });
  res.json(items);
}

module.exports = {
  createWarranty,
  listAllWarranties,
  listWarrantyForClient,
  adminUpdateWarranty,
  agentUpdateWarranty,
  listWarrantyForAgent
};
