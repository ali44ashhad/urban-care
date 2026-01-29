const multer = require('multer');

const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const pdfType = 'application/pdf';

// Avatar: memory storage → Cloudinary in route
const avatarFileFilter = (req, file, cb) => {
  if (imageTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
};
const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('avatar');

// Warranty: memory storage → Cloudinary in routes
const warrantyFileFilter = (req, file, cb) => {
  if (file.fieldname === 'warrantySlip' || file.fieldname === 'attachments') {
    if (imageTypes.includes(file.mimetype) || file.mimetype === pdfType) cb(null, true);
    else cb(new Error('Only image files and PDF are allowed for warranty'), false);
  } else {
    if (imageTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
};
const warrantyUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: warrantyFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});
const uploadWarrantySlip = warrantyUpload.single('warrantySlip');
const uploadWarranty = warrantyUpload.array('attachments', 5);

module.exports = {
  uploadAvatar,
  uploadWarrantySlip,
  uploadWarranty
};
