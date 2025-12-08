const Notification = require('../models/notification.model');
const logger = require('../utils/logger');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await Notification.find({ toUserId: userId })
      .sort('-createdAt')
      .limit(50);

    res.json(notifications);
  } catch (error) {
    logger.error(`Get notifications error: ${error.message}`);
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, toUserId: userId },
      { status: 'sent' },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    logger.error(`Mark notification as read error: ${error.message}`);
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateMany(
      { toUserId: userId, status: 'queued' },
      { status: 'sent' }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    logger.error(`Mark all as read error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      toUserId: userId
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    logger.error(`Delete notification error: ${error.message}`);
    next(error);
  }
};
