const express = require('express');
const router = express.Router();
const bookings = require('../controllers/bookings.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/role.middleware');
const { uploadWarrantySlip } = require('../middlewares/upload.middleware');

router.post('/', authMiddleware, permit('client'), bookings.createBooking);
router.get('/', authMiddleware, bookings.listBookings);
router.get('/:id', authMiddleware, bookings.getBooking);
router.post('/:id/assign', authMiddleware, permit('admin'), bookings.assignProvider);
router.post('/:id/accept', authMiddleware, permit('provider'), bookings.acceptBooking);
router.post('/:id/reject', authMiddleware, permit('provider'), bookings.rejectBooking);
router.post('/:id/cancel', authMiddleware, bookings.cancelBooking);
router.post('/:id/in_progress', authMiddleware, permit('provider'), bookings.markInProgress);
router.post('/:id/complete', authMiddleware, permit('provider'), bookings.completeBooking);
router.post('/:id/warranty-slip', authMiddleware, permit('provider'), uploadWarrantySlip, bookings.uploadWarrantySlip);
router.post('/:id/extra-services', authMiddleware, permit('provider'), bookings.addExtraService);
router.post('/:id/extra-services/confirm', authMiddleware, permit('client'), bookings.confirmExtraServices);

module.exports = router;
