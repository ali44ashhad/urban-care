 const express = require('express');
const router = express.Router();
const { 
  createWarranty, 
  listWarrantyForClient, 
  adminUpdateWarranty,
  agentUpdateWarranty,
  listWarrantyForAgent,
  listAllWarranties
} = require('../controllers/warranty.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/role.middleware');
const { uploadWarranty } = require('../middlewares/upload.middleware');

router.post('/', authMiddleware, permit('client'), uploadWarranty, createWarranty);
router.get('/', authMiddleware, permit('admin'), listAllWarranties); // Admin sees all warranties
router.get('/client', authMiddleware, permit('client'), listWarrantyForClient);
router.get('/agent', authMiddleware, permit('provider'), listWarrantyForAgent); // Provider sees only assigned warranties
router.patch('/:id/admin', authMiddleware, permit('admin'), adminUpdateWarranty);
router.patch('/:id/agent', authMiddleware, permit('provider'), agentUpdateWarranty);

module.exports = router;
