/**
 * @file encrypt.js
 * @description Module for encrypting and decrypting text using AES-256-CBC encryption.
 */
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

// Load .env variables
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Adjust path if necessary

// Ensure the encryption key is set in environment variables
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
	let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };


