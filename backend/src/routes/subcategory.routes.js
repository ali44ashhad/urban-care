const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategory.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/role.middleware');

router.get('/', subcategoryController.listByCategory);
router.post('/', authMiddleware, permit('admin'), subcategoryController.createSubcategory);
router.put('/:id', authMiddleware, permit('admin'), subcategoryController.updateSubcategory);
router.delete('/:id', authMiddleware, permit('admin'), subcategoryController.deleteSubcategory);

module.exports = router;
