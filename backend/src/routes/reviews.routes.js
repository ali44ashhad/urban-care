 const express = require('express');
const router = express.Router();
const reviews = require('../controllers/reviews.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/role.middleware');

router.post('/', authMiddleware, permit('client'), reviews.createReview);
router.get('/', reviews.listReviews); // Public for approved reviews, auth optional
router.get('/:id', authMiddleware, reviews.getReview);
router.put('/:id', authMiddleware, permit('client'), reviews.updateReview);
router.patch('/:id/approve', authMiddleware, permit('admin'), reviews.approveReview);
router.delete('/:id/reject', authMiddleware, permit('admin'), reviews.rejectReview);

module.exports = router;
