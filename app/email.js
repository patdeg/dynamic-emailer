// app/email.js
const nodemailer = require('nodemailer');
const logger = require('./utils/logger');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Create a transporter object using SMTP (configured for Gmail)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_PASS, // Your Gmail App Password
  },
  logger: true, // Enable built-in Nodemailer logging
  debug: true, // Show debug output
});

// Verify the connection configuration
transporter.verify(function(error, success) {
  if (error) {
    logger.error('Error connecting to SMTP server:', error);
  } else {
    logger.info('Connected to SMTP server successfully.');
  }
});

/**
 * Sends an email using the configured SMTP transporter.
 *
 * @param {Array|string} to - Recipient email addresses.
 * @param {string} subject - Subject of the email.
 * @param {string} htmlBody - HTML content of the email.
 * @param {Array} attachments - (Optional) Array of attachment objects.
 */
async function sendEmail(to, subject, htmlBody, attachments = []) {
  const mailOptions = {
    from: `"Patrick Deglon" <${process.env.GMAIL_USER}>`, // Sender address
    to: to, // List of recipients (comma-separated or array)
    subject: subject, // Subject line
    html: htmlBody, // HTML body content
    attachments: attachments, // Optional array of attachments
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    logger.info('Email sent:', info.messageId);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error; // Re-throw the error after logging
  }
}

module.exports = { sendEmail };


