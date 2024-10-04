/**
 * @file config.js
 * @description Module for handling application configuration, including reading configurations,
 * encryption and decryption of sensitive information, and validation of configurations.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const logger = require('./utils/logger');
const dotenv = require('dotenv');

// Load environment variables from the `.env` file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Encryption settings
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY)).digest('base64').substr(0, 32);
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a text using AES-256-CBC encryption.
 * @param {string} text - The plaintext to encrypt.
 * @returns {string} - The encrypted text in hex format.
 */
function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a text encrypted with AES-256-CBC encryption.
 * @param {string} text - The encrypted text in hex format.
 * @returns {string} - The decrypted plaintext.
 */
function decrypt(text) {
  console.log("Decrypt:",text);
  console.log("Key:",ENCRYPTION_KEY);

	let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * Replaces environment variables in the configuration object.
 * @param {Object} obj - The configuration object.
 */
function replaceEnvVariables(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/\$\{(\w+)\}/g, (_, v) => process.env[v] || '');
    } else if (typeof obj[key] === 'object') {
      replaceEnvVariables(obj[key]);
    }
  }
}

/**
 * Validates the configuration array for completeness and correctness.
 * @param {Array<Object>} config - The configuration array.
 * @throws Will throw an error if the configuration is invalid.
 */
function validateConfig(config) {
  config.forEach((conf) => {
    if (conf.SystemType.toLowerCase() === 'smtp') {
      if (!conf.Host || !conf.Port || !conf.Username || !conf.Password) {
        throw new Error(`Incomplete SMTP configuration for system ${conf.System}`);
      }
    }
    if (conf.SystemType.toLowerCase() === 'bigquery') {
      if (!conf.ProjectId || !conf.KeyFile) {
        throw new Error(`Incomplete BigQuery configuration for system ${conf.System}`);
      }
    }
    // Add more validations as needed
  });
}

/**
 * Reads and parses the configuration file, decrypts passwords, and validates configurations.
 * @returns {Array<Object>} - The array of system configurations.
 */
function readConfig() {
  const configPath = process.env.EMAILER_CONFIG || path.join(__dirname, '../.emailer_credentials');
  
  if (!fs.existsSync(configPath)) {
    logger.error(`Configuration file not found: ${configPath}`);
    process.exit(1);
  }
  
  const jsonData = fs.readFileSync(configPath, 'utf8');
  let config;
  
  try {
    config = JSON.parse(jsonData);
  } catch (err) {
    logger.error('Failed to parse configuration file:', err);
    logger.error(`Stack trace: ${err.stack}`);
	  process.exit(1);
  }
  
  config.forEach((conf) => {
    replaceEnvVariables(conf);
    // Decrypt Password if SystemType is not BigQuery
    if (conf.SystemType.toLowerCase() !== 'bigquery' && conf.Password) {
      try {
        conf.Password = decrypt(conf.Password);
      } catch (err) {
        logger.error(`Failed to decrypt password for system ${conf.System}:`, err);
    logger.error(`Stack trace: ${err.stack}`);
	      process.exit(1);
      }
    }
    // BigQuery uses KeyFile instead of Password
  });
  
  validateConfig(config);
  
  return config;
}

module.exports = { readConfig, encrypt, decrypt };


