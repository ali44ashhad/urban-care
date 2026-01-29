/**
 * Debug utility to check Twilio configuration
 * Run this to verify your Twilio setup
 */

const twilio = require('twilio');

function checkTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  // console.log('\n🔍 Twilio Configuration Check:');
  console.log('================================');
  
  if (!accountSid) {
    console.error('❌ TWILIO_ACCOUNT_SID is missing');
  } else {
    console.log('✅ TWILIO_ACCOUNT_SID:', accountSid.substring(0, 10) + '...');
  }

  if (!authToken) {
    console.error('❌ TWILIO_AUTH_TOKEN is missing');
  } else {
    console.log('✅ TWILIO_AUTH_TOKEN:', authToken.substring(0, 10) + '...');
  }

  if (!verifyServiceSid) {
    console.error('❌ TWILIO_VERIFY_SERVICE_SID is missing');
    console.error('   Create a Verify Service at: https://console.twilio.com/us1/develop/verify/services');
  } else {
    console.log('✅ TWILIO_VERIFY_SERVICE_SID:', verifyServiceSid);
  }

  // console.log('\n📝 Required .env variables:');
  // console.log('   TWILIO_ACCOUNT_SID=AC...');
  // console.log('   TWILIO_AUTH_TOKEN=...');
  // console.log('   TWILIO_VERIFY_SERVICE_SID=VA...');
  // console.log('\n');

  // Try to initialize client
  if (accountSid && authToken) {
    try {
      const client = twilio(accountSid, authToken);
      console.log('✅ Twilio client initialized successfully');
      return { valid: true, client };
    } catch (error) {
      console.error('❌ Failed to initialize Twilio client:', error.message);
      return { valid: false, error: error.message };
    }
  }

  return { valid: false, error: 'Missing credentials' };
}

module.exports = { checkTwilioConfig };
