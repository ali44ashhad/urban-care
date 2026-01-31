 const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user.model');
const { signToken } = require('../utils/jwt.util');
const { sendEmail } = require('../utils/email.util');
const { sendOTP, verifyOTP, formatPhoneNumber } = require('../utils/twilio.util');

/** Find user by phone — tries formatted (e.g. +919027714720) then raw 10-digit for backward compatibility */
async function findUserByPhone(formattedPhone) {
  let user = await User.findOne({ phone: formattedPhone });
  if (!user && formattedPhone.startsWith('+91') && formattedPhone.length >= 13) {
    const tenDigit = formattedPhone.replace(/\D/g, '').slice(-10);
    if (tenDigit.length === 10) user = await User.findOne({ phone: tenDigit });
  }
  return user;
}

// Register (client or provider or admin) - Step 1: Create user and send OTP
async function register(req, res) {
  const { name, email, password, role, phone, profile } = req.body;
  if (!name || !role || !phone) {
    return res.status(400).json({ message: 'Missing required fields (name, role, phone)' });
  }

  try {
    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);
    
    // Check if phone already exists (enforce uniqueness)
    const existingByPhone = await User.findOne({ phone: formattedPhone });
    if (existingByPhone) {
      return res.status(409).json({ message: 'Phone number already registered. Please login instead.' });
    }

    // Check email if provided (optional but unique if provided)
    if (email) {
      const existingByEmail = await User.findOne({ email });
      if (existingByEmail) {
        return res.status(409).json({ message: 'Email already exists' });
      }
    }

    // Create user (but don't activate yet - will be activated after OTP verification)
    // Password is optional now, but hash it if provided for existing users
    // Only set email when non-empty so we don't store email: null (avoids E11000 duplicate key with sparse unique index)
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    const userData = { name, role, phone: formattedPhone, profile, isActive: false };
    if (passwordHash) userData.passwordHash = passwordHash;
    if (email && String(email).trim()) userData.email = email.trim();
    const user = new User(userData);
    await user.save();

    console.log('✅ User created, sending OTP to:', formattedPhone);
    // Send OTP to phone
    const otpResult = await sendOTP(formattedPhone);

    res.status(201).json({ 
      message: 'OTP sent to your phone number',
      userId: user._id,
      phone: formattedPhone,
      requiresVerification: true,
      expiresAt: otpResult.expiresAt,
      expiresIn: otpResult.expiresIn
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern
    });
    
    // Handle duplicate phone error
    if (error.code === 11000 && error.keyPattern?.phone) {
      return res.status(409).json({ message: 'Phone number already registered. Please login instead.' });
    }
    
    res.status(500).json({ 
      message: error.message || 'Registration failed',
      error: error.message
    });
  }
}

// Verify OTP and complete registration
async function verifyRegistration(req, res) {
  const { userId, phone, code } = req.body;
  if (!userId || !phone || !code) {
    return res.status(400).json({ message: 'User ID, phone, and OTP code are required' });
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);
    
    // Verify OTP
    const verification = await verifyOTP(formattedPhone, code);
    if (!verification.valid) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Activate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    // Generate token
    const token = signToken(user);
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        address: user.address,
        createdAt: user.createdAt
      } 
    });
  } catch (error) {
    console.error('Verify registration error:', error);
    res.status(500).json({ message: error.message || 'Verification failed' });
  }
}

// Login - Step 1: Send OTP to phone number (phone-only authentication)
async function login(req, res) {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    console.log('🔐 Login request for phone:', phone);
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);
    console.log('📱 Formatted phone:', formattedPhone);

    // Find user by phone (formatted or raw 10-digit)
    const user = await findUserByPhone(formattedPhone);
    
    if (!user) {
      // Don't reveal if user exists - send OTP anyway for security
      // But we'll handle this in verifyLogin
      console.log('👤 User not found, sending OTP anyway for security');
      try {
        const otpResult = await sendOTP(formattedPhone);
        return res.json({ 
          message: 'OTP sent to your phone number',
          phone: formattedPhone,
          requiresVerification: true,
          isNewUser: true, // Indicate this might be a new user
          expiresAt: otpResult.expiresAt,
          expiresIn: otpResult.expiresIn
        });
      } catch (otpError) {
        console.error('❌ OTP send failed for new user:', otpError);
        return res.status(400).json({ 
          message: otpError.message || 'Failed to send OTP. Please check your phone number and try again.',
          error: otpError.message
        });
      }
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account not active. Please contact support.' });
    }

    console.log('✅ User found, sending OTP');
    // Send OTP to user's phone
    const otpResult = await sendOTP(formattedPhone);

    res.json({ 
      message: 'OTP sent to your phone number',
      userId: user._id,
      phone: formattedPhone,
      requiresVerification: true,
      expiresAt: otpResult.expiresAt,
      expiresIn: otpResult.expiresIn
    });
  } catch (error) {
    console.error('❌ Login send OTP error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: error.message || 'Failed to send OTP',
      error: error.message
    });
  }
}

// Verify OTP and complete login (phone-only authentication)
async function verifyLogin(req, res) {
  const { phone, code, userId } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ message: 'Phone number and OTP code are required' });
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);
    
    // Verify OTP first
    const verification = await verifyOTP(formattedPhone, code);
    if (!verification.valid) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Find user by phone (userId optional; try formatted then raw 10-digit)
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      user = await findUserByPhone(formattedPhone);
    }

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found. Please register first.',
        requiresRegistration: true
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account not active. Please contact support.' });
    }

    // Normalize stored phone to formatted for response if it was stored raw
    const storedPhone = user.phone;
    const normalizedStored = storedPhone && storedPhone.startsWith('+') ? storedPhone : formatPhoneNumber(storedPhone);
    if (normalizedStored !== formattedPhone) {
      return res.status(400).json({ message: 'Phone number mismatch' });
    }

    const token = signToken(user);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        address: user.address,
        createdAt: user.createdAt
      } 
    });
  } catch (error) {
    console.error('Verify login error:', error);
    res.status(500).json({ message: error.message || 'Verification failed' });
  }
}

// Resend OTP
async function resendOTP(req, res) {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);
    await sendOTP(formattedPhone);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
}

// Update Profile (authenticated user)
async function updateProfile(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, email, phone, bio, avatar, address, companyName } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (address) user.address = address;
    if (companyName !== undefined) user.companyName = companyName;

    await user.save();

    res.json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      phone: user.phone,
      bio: user.bio,
      avatar: user.avatar,
      address: user.address,
      companyName: user.companyName,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Forgot Password - generate reset token
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset?token=${resetToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Reset Password - verify token and update password
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Change Password - for authenticated users
async function changePassword(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update to new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get Profile - fetch current user data
async function getProfile(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      bio: user.bio,
      avatar: user.avatar,
      address: user.address,
      companyName: user.companyName,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { 
  register, 
  verifyRegistration,
  login, 
  verifyLogin,
  resendOTP,
  getProfile, 
  updateProfile, 
  forgotPassword, 
  resetPassword, 
  changePassword 
};

