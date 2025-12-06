require('dotenv').config();
const connectDB = require('../src/config/db');
const logger = require('../src/utils/logger');

// Add your migration logic here
const migrate = async () => {
  try {
    await connectDB();

    logger.info('Running migrations...');

    // Example: Add indexes
    // await User.createIndexes();
    // await Service.createIndexes();
    // await Booking.createIndexes();

    // Example: Data transformations
    // await User.updateMany({}, { $set: { isActive: true } });

    logger.info('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Migration error: ${error.message}`);
    process.exit(1);
  }
};

migrate();
