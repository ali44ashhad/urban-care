 const express = require('express');
const router = express.Router();
const { listServices, getService, createService, updateService, deleteService } = require('../controllers/services.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/role.middleware');

router.get('/', listServices);
router.get('/:id', getService);

// admin only
router.post('/', authMiddleware, permit('admin'), createService);
router.put('/:id', authMiddleware, permit('admin'), updateService);
router.delete('/:id', authMiddleware, permit('admin'), deleteService);

module.exports = router;
