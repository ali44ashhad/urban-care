 const Service = require('../models/service.model');
const User = require('../models/user.model');
const Booking = require('../models/booking.model');
const Warranty = require('../models/warranty.model');
const Review = require('../models/review.model');

// onboard provider (admin)
async function onboardProvider(req, res) {
  const { name, email, password, phone, profile } = req.body;
  // create provider user
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(password || 'changeme', 10);
  const provider = new User({ name, email, passwordHash, role: 'provider', phone, profile });
  await provider.save();
  res.status(201).json(provider);
}

async function assignProviderToService(req, res) {
  const { providerId, serviceId } = req.body;
  const provider = await User.findById(providerId);
  if (!provider) return res.status(404).json({ message: 'Provider not found' });
  provider.profile = provider.profile || {};
  provider.profile.servicesOffered = provider.profile.servicesOffered || [];
  if (!provider.profile.servicesOffered.some(s => String(s) === String(serviceId))) {
    provider.profile.servicesOffered.push(serviceId);
  }
  await provider.save();
  res.json(provider);
}

// manage bookings + warranty + reviews
async function listAllBookings(req, res) {
  const { page = 1, limit = 50, status } = req.query;
  const f = {};
  if (status) f.status = status;
  const items = await Booking.find(f).limit(Number(limit)).skip((page - 1) * limit).sort({ createdAt: -1 });
  res.json({ items });
}

async function approveWarranty(req, res) {
  const { id } = req.params;
  const { action, note } = req.body; // action: approve/reject/resolve
  const w = await Warranty.findById(id);
  if (!w) return res.status(404).json({ message: 'Warranty not found' });
  if (action === 'approve') w.status = 'approved';
  if (action === 'reject') w.status = 'rejected';
  if (action === 'resolve') w.status = 'resolved';
  w.adminNotes = note || w.adminNotes;
  await w.save();
  res.json(w);
}

async function moderateReview(req, res) {
  const { id } = req.params;
  const { action } = req.body; // approve/remove
  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  if (action === 'approve') review.isApproved = true;
  if (action === 'remove') {
    review.isApproved = false;
    review.comment = '[Removed by admin]';
  }
  await review.save();
  res.json(review);
}

async function getAnalytics(req, res) {
  const { range = '30d' } = req.query;
  
  // Calculate date range
  const days = parseInt(range) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get bookings count
  const bookingsCount = await Booking.countDocuments({
    createdAt: { $gte: startDate }
  });
  
  // Calculate revenue from completed bookings
  const revenueData = await Booking.aggregate([
    {
      $match: {
        status: { $in: ['completed', 'warranty_claimed'] },
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$price' }
      }
    }
  ]);
  const revenue = revenueData.length > 0 ? revenueData[0].total : 0;
  
  // Get average rating
  const ratingData = await Review.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  const avgRating = ratingData.length > 0 ? ratingData[0].avgRating.toFixed(1) : 0;
  
  // Get status breakdown
  const statusBreakdown = await Booking.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  res.json({
    bookingsCount,
    revenue,
    avgRating,
    statusBreakdown,
    range: `${days}d`
  });
}

async function listUsers(req, res) {
  const { role, page = 1, limit = 50, isActive } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const users = await User.find(filter)
    .select('-password')
    .limit(Number(limit))
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });
  
  const total = await User.countDocuments(filter);
  
  res.json({ items: users, total, page: Number(page) });
}

async function toggleUserStatus(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;
  
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  user.isActive = isActive;
  await user.save();
  
  res.json(user);
}

// Get pending booking requests for admin dashboard
async function getPendingRequests(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  const items = await Booking.find({ status: 'pending' })
    .populate('serviceId', 'title basePrice')
    .populate('clientId', 'name email phone avatar')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  
  const total = await Booking.countDocuments({ status: 'pending' });
  
  res.json({ items, total, page: Number(page), limit: Number(limit) });
}

// List all warranty claims for admin
async function listAllWarrantyClaims(req, res) {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  
  const skip = (page - 1) * limit;
  const items = await Warranty.find(filter)
    .populate({
      path: 'bookingId',
      populate: [
        { path: 'serviceId', select: 'title category price images image' },
        { path: 'providerId', select: 'name email phone companyName avatar' }
      ]
    })
    .populate('clientId', 'name email phone')
    .populate('assignedAgentId', 'name email phone')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  
  const total = await Warranty.countDocuments(filter);
  
  res.json({ items, total, page: Number(page), limit: Number(limit) });
}

// Get all service agents (providers) for assignment
async function listServiceAgents(req, res) {
  const agents = await User.find({ 
    role: 'provider', 
    isActive: true 
  }).select('name email phone companyName avatar');
  
  res.json(agents);
}

module.exports = { 
  onboardProvider, 
  assignProviderToService, 
  listAllBookings, 
  approveWarranty, 
  moderateReview,
  getAnalytics,
  listUsers,
  toggleUserStatus,
  getPendingRequests,
  listAllWarrantyClaims,
  listServiceAgents
};
