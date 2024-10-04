/**
 * @file logger.js
 * @description Custom logger using Winston for consistent logging across the application.
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  level: 'debug', // Adjust based on your needs (e.g., 'info', 'error')
  format: format.combine(
    format.timestamp(),
    format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
  ),
  transports: [
    new transports.Console(),
    // Optional: Log to a file
    // new transports.File({ filename: path.resolve(__dirname, '../../logs/app.log') })
  ],
});

module.exports = logger;


