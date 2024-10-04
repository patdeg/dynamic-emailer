/**
 * @file email.js
 * @description Module for sending emails using Nodemailer.
 */

const nodemailer = require('nodemailer');
const logger = require('./utils/logger');
const { readConfig } = require('./config');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the `.env` file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create a transporter object using SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
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
 * @param {Array|string} to - Recipient email addresses.
 * @param {string} subject - Subject of the email.
 * @param {string} htmlBody - HTML content of the email.
 * @param {Array} attachments - (Optional) Array of attachment objects.
 */
async function sendEmail(to, subject, htmlBody, attachments = []) {
  const mailOptions = {
    from: process.env.SMTP_HOST, // Sender address
    to: to, // List of recipients (comma-separated or array)
    subject: subject, // Subject line
    html: htmlBody, // HTML body content
    attachments: attachments, // Optional array of attachments
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    logger.info('Email sent:', info.messageId);
  } catch (err) {
    logger.error('Error sending email:', err);
    logger.error(`Stack trace: ${err.stack}`);
	  throw error; // Re-throw the error after logging
  }
}

module.exports = { sendEmail };


