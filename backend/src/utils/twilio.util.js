const twilio = require('twilio');

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID  ;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID ;

// Rate limiting: Track OTP requests per phone number
// Format: { phone: { count: number, lastRequest: timestamp, resetAt: timestamp } }
const rateLimitStore = new Map();

// OTP expiry: 5 minutes (300000 ms)
const OTP_EXPIRY_MS = 5 * 60 * 1000;

// Rate limit: Max 3 OTP requests per phone per 15 minutes
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;

/**
 * Check if phone number is rate limited
 * @param {string} phoneNumber - Phone number
 * @returns {Object} - { allowed: boolean, retryAfter?: number }
 */
function checkRateLimit(phoneNumber) {
  const now = Date.now();
  const record = rateLimitStore.get(phoneNumber);

  if (!record) {
    return { allowed: true };
  }

  // Check if window has expired
  if (now > record.resetAt) {
    rateLimitStore.delete(phoneNumber);
    return { allowed: true };
  }

  // Check if limit exceeded
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000); // seconds
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

/**
 * Record an OTP request for rate limiting
 * @param {string} phoneNumber - Phone number
 */
function recordOTPRequest(phoneNumber) {
  const now = Date.now();
  const record = rateLimitStore.get(phoneNumber);

  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(phoneNumber, {
      count: 1,
      lastRequest: now,
      resetAt: now + RATE_LIMIT_WINDOW_MS
    });
  } else {
    // Increment count in existing window
    record.count++;
    record.lastRequest = now;
  }

  // Clean up old entries periodically (every 30 minutes)
  if (Math.random() < 0.01) { // 1% chance to clean up
    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    for (const [phone, data] of rateLimitStore.entries()) {
      if (data.resetAt < cutoff) {
        rateLimitStore.delete(phone);
      }
    }
  }
}

// Initialize Twilio client lazily (only when needed and credentials are available)
function getTwilioClient() {
  if (!authToken) {
    throw new Error('TWILIO_AUTH_TOKEN is not set in environment variables. Please add it to your .env file.');
  }
  if (!accountSid) {
    throw new Error('TWILIO_ACCOUNT_SID is not set in environment variables.');
  }
  return twilio(accountSid, authToken);
}

/**
 * Send OTP to phone number using Twilio Verify
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +919876543210)
 * @returns {Promise<Object>} - Twilio verification response with expiry
 */
async function sendOTP(phoneNumber) {
  try {
    // Check all credentials before proceeding
    if (!authToken) {
      throw new Error('TWILIO_AUTH_TOKEN is not set in environment variables. Please add it to your .env file and restart the server.');
    }
    if (!accountSid) {
      throw new Error('TWILIO_ACCOUNT_SID is not set in environment variables. Please add it to your .env file and restart the server.');
    }
    if (!verifyServiceSid) {
      throw new Error('TWILIO_VERIFY_SERVICE_SID is not set in environment variables. Please add it to your .env file and restart the server.');
    }

    // Ensure phone number is in E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('📱 Sending OTP to:', formattedPhone);

    // Check rate limit
    const rateLimitCheck = checkRateLimit(formattedPhone);
    if (!rateLimitCheck.allowed) {
      throw new Error(
        `Too many OTP requests. Please try again after ${rateLimitCheck.retryAfter} seconds.`
      );
    }

    // Get Twilio client (will throw if credentials are invalid)
    const client = getTwilioClient();
    console.log('✅ Twilio client initialized');

    console.log('📤 Creating verification with service SID:', verifyServiceSid);
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications
      .create({
        to: formattedPhone,
        channel: 'sms'
      });

    console.log('✅ OTP sent successfully. Verification SID:', verification.sid, 'Status:', verification.status);

    // Record the request for rate limiting
    recordOTPRequest(formattedPhone);

    // Calculate expiry time
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    return {
      success: true,
      sid: verification.sid,
      status: verification.status,
      expiresAt,
      expiresIn: OTP_EXPIRY_MS / 1000 // seconds
    };
  } catch (error) {
    console.error('❌ Twilio send OTP error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo
    });
    
    // Re-throw rate limit errors as-is
    if (error.message.includes('Too many OTP requests')) {
      throw error;
    }
    
    // Check for missing service SID
    if (error.message.includes('TWILIO_VERIFY_SERVICE_SID') || error.message.includes('not set')) {
      throw error;
    }
    
    // Provide more helpful error messages
    if (error.message.includes('Authenticate') || error.message.includes('401')) {
      throw new Error('Twilio authentication failed. Please check your TWILIO_AUTH_TOKEN and TWILIO_ACCOUNT_SID in the .env file.');
    }
    
    // Check for invalid service SID
    if (error.code === 20404 || error.message.includes('Service') || error.message.includes('not found')) {
      throw new Error(
        `Twilio Verify Service not found. Please check your TWILIO_VERIFY_SERVICE_SID in the .env file. ` +
        `Create a Verify Service at: https://console.twilio.com/us1/develop/verify/services`
      );
    }
    
    if (error.message.includes('unverified') || error.message.includes('Trial')) {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      throw new Error(
        `Phone number ${formattedPhone} is not verified in your Twilio account. ` +
        `Trial accounts can only send SMS to verified numbers. ` +
        `Please verify your phone number at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified`
      );
    }
    if (error.message.includes('TWILIO_AUTH_TOKEN') || error.message.includes('TWILIO_ACCOUNT_SID')) {
      throw error; // Re-throw our custom error as-is
    }
    
    throw new Error(`Failed to send OTP: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Verify OTP code
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} code - OTP code entered by user
 * @returns {Promise<Object>} - Verification result
 */
async function verifyOTP(phoneNumber, code) {
  try {
    // Check credentials before proceeding
    if (!authToken) {
      throw new Error('TWILIO_AUTH_TOKEN is not set in environment variables. Please add it to your .env file and restart the server.');
    }

    // Get Twilio client (will throw if credentials are invalid)
    const client = getTwilioClient();

    // Ensure phone number is in E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks
      .create({
        to: formattedPhone,
        code: code
      });

    return {
      success: verificationCheck.status === 'approved',
      status: verificationCheck.status,
      valid: verificationCheck.status === 'approved'
    };
  } catch (error) {
    console.error('Twilio verify OTP error:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('Authenticate') || error.message.includes('401')) {
      throw new Error('Twilio authentication failed. Please check your TWILIO_AUTH_TOKEN in the .env file.');
    }
    if (error.message.includes('TWILIO_AUTH_TOKEN')) {
      throw error; // Re-throw our custom error as-is
    }
    
    throw new Error(`Failed to verify OTP: ${error.message}`);
  }
}

/**
 * Format phone number to E.164 format
 * @param {string} phoneNumber - Phone number in any format
 * @returns {string} - Phone number in E.164 format
 */
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) {
    throw new Error('Phone number is required');
  }

  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');

  // If it starts with 0, remove it
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // If it doesn't start with country code, assume India (+91)
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  // Add + prefix
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

module.exports = {
  sendOTP,
  verifyOTP,
  formatPhoneNumber,
  OTP_EXPIRY_MS
};
