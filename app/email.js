/**
 * @file email.js
 * @description Module for sending emails using Nodemailer.
 */

const nodemailer = require('nodemailer');
const logger = require('./utils/logger');
const { readConfig } = require('./config');

// Get SMTP configuration from the configurations
const smtpConfig = readConfig().find(conf => conf.SystemType.toLowerCase() === 'smtp');

if (!smtpConfig) {
  logger.error('SMTP configuration not found in the configurations.');
  process.exit(1);
}

// Create a transporter object using SMTP configuration
const transporter = nodemailer.createTransport({
  host: smtpConfig.Host,
  port: smtpConfig.Port,
  secure: smtpConfig.Secure || false, // true for 465, false for other ports
  auth: {
    user: smtpConfig.Username,
    pass: smtpConfig.Password,
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
    from: smtpConfig.FromAddress || `"Emailer.js" <${smtpConfig.Username}>`, // Sender address
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
    logger.error(`Stack trace: ${err.stack}`);
	  throw error; // Re-throw the error after logging
  }
}

module.exports = { sendEmail };


