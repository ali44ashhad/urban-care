// Fix warranty-related booking statuses
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Booking = require('../src/models/booking.model');
const Warranty = require('../src/models/warranty.model');

async function fixWarrantyStatuses() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/urban-clap');
    console.log('Connected to database');

    // Find all bookings with warranty_requested status
    const bookings = await Booking.find({ status: 'warranty_requested' });
    console.log(`Found ${bookings.length} bookings with warranty_requested status`);

    for (const booking of bookings) {
      // Check if warranty is resolved or rejected
      const warranties = await Warranty.find({ 
        bookingId: booking._id,
        status: { $in: ['resolved', 'rejected'] }
      });

      if (warranties.length > 0) {
        console.log(`Booking ${booking._id} has resolved/rejected warranty. Updating status to completed.`);
        booking.status = 'completed';
        await booking.save();
      } else {
        console.log(`Booking ${booking._id} still has active warranty request.`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixWarrantyStatuses();
