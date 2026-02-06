const express = require('express');
const router = express.Router();
const { register, verifyRegistration, login, verifyLogin, resendOTP, getProfile, updateProfile, forgotPassword, resetPassword, changePassword, deleteAccount, listAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const { uploadFromBuffer, isConfigured } = require('../utils/cloudinary');

router.post('/register', register);
router.post('/register/verify', verifyRegistration);
router.post('/login', login);
router.post('/login/verify', verifyLogin);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);
router.delete('/account', authMiddleware, deleteAccount);
router.get('/addresses', authMiddleware, listAddresses);
router.post('/addresses', authMiddleware, addAddress);
router.put('/addresses/:id', authMiddleware, updateAddress);
router.delete('/addresses/:id', authMiddleware, deleteAddress);
router.post('/upload-avatar', authMiddleware, uploadAvatar, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (!isConfigured()) {
      return res.status(503).json({ message: 'Avatar upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env' });
    }
    const result = await uploadFromBuffer(req.file.buffer, 'urban-care/avatars');
    const avatarUrl = result.secure_url;
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
