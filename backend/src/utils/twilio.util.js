const twilio = require('twilio');

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID  ;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID ;

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
 * @returns {Promise<Object>} - Twilio verification response
 */
async function sendOTP(phoneNumber) {
  try {
    // Check credentials before proceeding
    if (!authToken) {
      throw new Error('TWILIO_AUTH_TOKEN is not set in environment variables. Please add it to your .env file and restart the server.');
    }

    // Get Twilio client (will throw if credentials are invalid)
    const client = getTwilioClient();

    // Ensure phone number is in E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications
      .create({
        to: formattedPhone,
        channel: 'sms'
      });

    return {
      success: true,
      sid: verification.sid,
      status: verification.status
    };
  } catch (error) {
    console.error('Twilio send OTP error:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('Authenticate') || error.message.includes('401')) {
      throw new Error('Twilio authentication failed. Please check your TWILIO_AUTH_TOKEN in the .env file.');
    }
    if (error.message.includes('unverified') || error.message.includes('Trial')) {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      throw new Error(
        `Phone number ${formattedPhone} is not verified in your Twilio account. ` +
        `Trial accounts can only send SMS to verified numbers. ` +
        `Please verify your phone number at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified`
      );
    }
    if (error.message.includes('TWILIO_AUTH_TOKEN')) {
      throw error; // Re-throw our custom error as-is
    }
    
    throw new Error(`Failed to send OTP: ${error.message}`);
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
  formatPhoneNumber
};
