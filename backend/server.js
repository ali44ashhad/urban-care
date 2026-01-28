require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const config = require('./src/config');
const { checkTwilioConfig } = require('./src/utils/twilio-debug');

const PORT = config.port || 5000;

(async function start() {
  try {
    await connectDB(config.mongoUri);
    
    // Check Twilio configuration on startup
    checkTwilioConfig();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (${config.nodeEnv})`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
