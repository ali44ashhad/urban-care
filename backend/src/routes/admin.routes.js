 const express = require('express');
const router = express.Router();
const admin = require('../controllers/admin.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/role.middleware');

router.post('/providers', authMiddleware, permit('admin'), admin.onboardProvider);
router.post('/assign-provider', authMiddleware, permit('admin'), admin.assignProviderToService);
router.get('/bookings', authMiddleware, permit('admin'), admin.listAllBookings);
router.get('/pending-requests', authMiddleware, permit('admin'), admin.getPendingRequests);
router.get('/warranty-claims', authMiddleware, permit('admin'), admin.listAllWarrantyClaims);
router.get('/service-agents', authMiddleware, permit('admin'), admin.listServiceAgents);
router.post('/warranty/:id', authMiddleware, permit('admin'), admin.approveWarranty);
router.post('/review/:id', authMiddleware, permit('admin'), admin.moderateReview);
router.get('/analytics', authMiddleware, permit('admin'), admin.getAnalytics);
router.get('/users', authMiddleware, permit('admin'), admin.listUsers);
router.patch('/users/:id/status', authMiddleware, permit('admin'), admin.toggleUserStatus);

module.exports = router;
