const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const servicesRoutes = require('./services.routes');
const bookingsRoutes = require('./bookings.routes');
const adminRoutes = require('./admin.routes');
const reviewsRoutes = require('./reviews.routes');
const warrantyRoutes = require('./warranty.routes');
const notificationsRoutes = require('./notifications.routes');
const categoryRoutes = require('./category.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/services', servicesRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/admin', adminRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/warranty', warrantyRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
