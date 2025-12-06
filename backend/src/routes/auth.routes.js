 const express = require('express');
const router = express.Router();
const { register, login, updateProfile, forgotPassword, resetPassword, changePassword } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);
router.post('/upload-avatar', authMiddleware, uploadAvatar, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return the file URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    res.json({ 
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl,
      url: avatarUrl
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
