const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const avatarDir = path.join(__dirname, '../../uploads/avatars');
const warrantyDir = path.join(__dirname, '../../uploads/warranty-slips');

[avatarDir, warrantyDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use warranty directory for warranty slips and attachments, avatars for everything else
    const uploadDir = (file.fieldname === 'warrantySlip' || file.fieldname === 'attachments') ? warrantyDir : avatarDir;
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId-timestamp.ext
    const userId = req.user?.id || req.user?._id || 'user';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${userId}-${uniqueSuffix}${ext}`);
  }
});

// File filter - images for avatars, images and PDFs for warranty slips
const fileFilter = (req, file, cb) => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const pdfType = 'application/pdf';
  
  // Allow PDF and images for warranty slips and attachments
  if (file.fieldname === 'warrantySlip' || file.fieldname === 'attachments') {
    if (imageTypes.includes(file.mimetype) || file.mimetype === pdfType) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) and PDF are allowed for warranty slips'), false);
    }
  } else {
    // Only images for avatars
    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
    }
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size (increased for PDFs)
  }
});

// Export different upload configurations
const uploadAvatar = upload.single('avatar');
const uploadWarrantySlip = upload.single('warrantySlip');
const uploadWarranty = upload.array('attachments', 5); // Max 5 attachment files for warranty claims

module.exports = { 
  upload,
  uploadAvatar,
  uploadWarrantySlip,
  uploadWarranty
};
