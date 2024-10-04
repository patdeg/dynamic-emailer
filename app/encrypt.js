/**
 * @file encrypt.js
 * @description Module for encrypting and decrypting text using AES-256-CBC encryption.
 */
const crypto = require('crypto');

// Ensure the encryption key is set in environment variables
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY)).digest('base64').substr(0, 32);
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a text using AES-256-CBC encryption.
 * @param {string} text - The plaintext to encrypt.
 * @returns {string} - The encrypted text in hex format (with IV).
 */
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Return the IV and the encrypted text in hex format, separated by a colon
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a text encrypted with AES-256-CBC encryption.
 * @param {string} text - The encrypted text in hex format.
 * @returns {string} - The decrypted plaintext.
 */
function decrypt(text) {
console.log("in:",text);
console.log("key:", ENCRYPTION_KEY);

	const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex'); // Extract the IV
  const encryptedText = Buffer.from(textParts.join(':'), 'hex'); // Remaining is the encrypted text
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
console.log(decrypted.toString());

  return decrypted.toString();
}

module.exports = { encrypt, decrypt };


