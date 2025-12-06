 const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass
  }
});

async function sendEmail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject,
    text,
    html
  });
  return info;
}

module.exports = { sendEmail };
