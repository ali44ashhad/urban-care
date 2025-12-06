 const Review = require('../models/review.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const Service = require('../models/service.model');

async function createReview(req, res) {
  const clientId = req.user._id;
  const { bookingId, rating, title, comment, text } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.clientId) !== String(clientId)) return res.status(403).json({ message: 'Forbidden' });

  // Check if review already exists for this booking
  const existingReview = await Review.findOne({ bookingId, clientId });
  if (existingReview) {
    return res.status(400).json({ message: 'You have already reviewed this booking' });
  }

  const review = new Review({ 
    bookingId, 
    clientId, 
    providerId: booking.providerId, 
    rating, 
    title, 
    comment: comment || text, // Support both 'comment' and 'text' field names
    isApproved: false 
  });
  await review.save();

  // Update provider aggregated rating
  if (booking.providerId) {
    const provider = await User.findById(booking.providerId);
    provider.profile = provider.profile || {};
    provider.profile.ratingCount = (provider.profile.ratingCount || 0) + 1;
    provider.profile.ratingAvg = ((provider.profile.ratingAvg || 0) * ((provider.profile.ratingCount || 0) - 1) + rating) / (provider.profile.ratingCount);
    await provider.save();
  }

  // Update service rating and reviewCount
  if (booking.serviceId) {
    const service = await Service.findById(booking.serviceId);
    if (service) {
      const serviceReviews = await Review.find({ 
        bookingId: { $in: await Booking.find({ serviceId: booking.serviceId }).distinct('_id') }
      });
      
      const totalRating = serviceReviews.reduce((sum, r) => sum + r.rating, 0) + rating;
      const totalReviews = serviceReviews.length + 1;
      
      service.rating = totalRating / totalReviews;
      service.reviewCount = totalReviews;
      await service.save();
    }
  }

  res.status(201).json(review);
}

async function listReviews(req, res) {
  const { bookingId, clientId, providerId, serviceId, pending, isApproved, page = 1, limit = 20 } = req.query;
  const filter = {};
  
  if (bookingId) filter.bookingId = bookingId;
  if (clientId) filter.clientId = clientId;
  if (providerId) filter.providerId = providerId;
  
  // Filter for pending reviews (for admin moderation)
  if (pending === 'true') {
    filter.isApproved = false;
  }
  
  // Filter for approved reviews (for public display)
  if (isApproved === 'true') {
    filter.isApproved = true;
  }

  // If serviceId is provided, find all bookings for that service first
  if (serviceId) {
    const bookings = await Booking.find({ serviceId }).distinct('_id');
    filter.bookingId = { $in: bookings };
  }

  const skip = (page - 1) * limit;
  const reviews = await Review.find(filter)
    .populate('clientId', 'name avatar')
    .populate('providerId', 'name companyName')
    .populate({
      path: 'bookingId',
      select: 'serviceId slot',
      populate: {
        path: 'serviceId',
        select: 'title category image images'
      }
    })
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Review.countDocuments(filter);

  res.json({ items: reviews, total, page: Number(page), limit: Number(limit) });
}

async function getReview(req, res) {
  const { id } = req.params;
  const review = await Review.findById(id)
    .populate('clientId', 'name avatar')
    .populate('providerId', 'name companyName')
    .populate('bookingId');
  
  if (!review) return res.status(404).json({ message: 'Review not found' });
  res.json(review);
}

async function updateReview(req, res) {
  const { id } = req.params;
  const clientId = req.user._id;
  const { rating, title, comment } = req.body;
  
  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  
  // Only the client who created the review can edit it
  if (String(review.clientId) !== String(clientId)) {
    return res.status(403).json({ message: 'You can only edit your own reviews' });
  }
  
  // Update fields
  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;
  
  await review.save();
  
  res.json({ message: 'Review updated', review });
}

async function approveReview(req, res) {
  const { id } = req.params;
  const review = await Review.findById(id);
  
  if (!review) return res.status(404).json({ message: 'Review not found' });
  
  review.isApproved = true;
  await review.save();
  
  res.json({ message: 'Review approved', review });
}

async function rejectReview(req, res) {
  const { id } = req.params;
  const review = await Review.findById(id);
  
  if (!review) return res.status(404).json({ message: 'Review not found' });
  
  // Either delete or mark as rejected
  await Review.findByIdAndDelete(id);
  
  res.json({ message: 'Review rejected and deleted' });
}

module.exports = { createReview, listReviews, getReview, updateReview, approveReview, rejectReview };
