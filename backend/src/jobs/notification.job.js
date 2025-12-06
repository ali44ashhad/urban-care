const Bull = require('bull');
const config = require('../config');
const logger = require('../utils/logger');

// Initialize Bull queue - use redisUrl if available, otherwise redis config
const notificationQueue = new Bull('notifications', config.redisUrl || {
  redis: {
    host: config.redis?.host || '127.0.0.1',
    port: config.redis?.port || 6379
  }
});

// Monitor queue events
notificationQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

notificationQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed: ${err.message}`);
});

notificationQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} stalled`);
});

module.exports = notificationQueue;
