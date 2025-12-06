const Notification = require('../models/notification.model');
const notificationQueue = require('../jobs/notification.job');
const { sendEmail, templates } = require('../utils/email.util');
const logger = require('../utils/logger');

exports.sendBookingNotification = async (booking) => {
  try {
    // Create in-app notification
    await Notification.create({
      user: booking.user,
      type: 'booking',
      title: 'Booking Created',
      message: `Your booking for ${booking.service.name} has been created successfully.`,
      link: `/bookings/${booking._id}`
    });

    // Queue email notification
    await notificationQueue.add('booking-confirmation', {
      userId: booking.user,
      booking
    });

    logger.info(`Booking notification sent for booking: ${booking._id}`);
  } catch (error) {
    logger.error(`Send booking notification error: ${error.message}`);
  }
};

exports.sendStatusUpdateNotification = async (booking) => {
  try {
    await Notification.create({
      user: booking.user,
      type: 'booking',
      title: 'Booking Status Updated',
      message: `Your booking status has been updated to ${booking.status}.`,
      link: `/bookings/${booking._id}`
    });

    logger.info(`Status update notification sent for booking: ${booking._id}`);
  } catch (error) {
    logger.error(`Send status update notification error: ${error.message}`);
  }
};

exports.sendReminderNotification = async (booking) => {
  try {
    await Notification.create({
      user: booking.user,
      type: 'booking',
      title: 'Booking Reminder',
      message: `Reminder: Your booking is scheduled for tomorrow at ${booking.scheduledTime}.`,
      link: `/bookings/${booking._id}`,
      priority: 'high'
    });

    // Queue email reminder
    await notificationQueue.add('booking-reminder', {
      userId: booking.user,
      booking
    });

    logger.info(`Reminder notification sent for booking: ${booking._id}`);
  } catch (error) {
    logger.error(`Send reminder notification error: ${error.message}`);
  }
};

// Generic notification enqueue function for warranty and other notifications
exports.enqueue = async ({ toUserId, type, channel = 'in-app', payload = {} }) => {
  try {
    // Create in-app notification
    if (channel === 'in-app' || channel === 'email') {
      await Notification.create({
        user: toUserId,
        type: type || 'system',
        title: payload.title || 'Notification',
        message: payload.message || '',
        link: payload.link || null,
        priority: payload.priority || 'normal'
      });
    }

    // Queue email if channel is email
    if (channel === 'email') {
      await notificationQueue.add('generic-notification', {
        userId: toUserId,
        type,
        payload
      });
    }

    logger.info(`Notification enqueued for user: ${toUserId}, type: ${type}`);
  } catch (error) {
    logger.error(`Enqueue notification error: ${error.message}`);
  }
};
