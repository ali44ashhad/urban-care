 const Notification = require('../models/notification.model');
const { sendEmail } = require('../utils/email.util');

async function processNotification(job) {
  const { id } = job.data;
  const note = await Notification.findById(id);
  if (!note) return Promise.resolve();

  try {
    if (note.channel === 'email') {
      const toUserId = note.toUserId;
      // fetch user's email
      const User = require('../models/user.model');
      const user = await User.findById(toUserId);
      if (!user) throw new Error('User not found for email');

      await sendEmail({
        to: user.email,
        subject: `Notification: ${note.type}`,
        text: note.payload.message || '',
        html: `<p>${note.payload.message || ''}</p>`
      });

      note.status = 'sent';
      note.sentAt = new Date();
      await note.save();
    } else {
      // other channels: push/sms (extend)
      note.status = 'sent';
      note.sentAt = new Date();
      await note.save();
    }
  } catch (err) {
    note.attempts = (note.attempts || 0) + 1;
    note.status = 'failed';
    await note.save();
    throw err;
  }
}

module.exports = { processNotification };
