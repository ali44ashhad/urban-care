 const Queue = require('bull');
const config = require('../config');
const { processNotification } = require('./notification.worker');
const redisUrl = config.redisUrl || 'redis://127.0.0.1:6379';

const notificationQueue = new Queue('notifications', redisUrl);

// process jobs
notificationQueue.process(processNotification);

console.log('Worker started: notificationQueue listening');
