/**
 * @file encrypt_password.js
 * @description Utility script to encrypt passwords using the encryption functions. Password input is masked.
 */

const { encrypt } = require('./encrypt');  // Import the encrypt function
const readlineSync = require('readline-sync');  // For masked input
const dotenv = require('dotenv');
const path = require('path');

// Load .env variables
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Adjust path if necessary

// Prompt for the password, masking the input
const password = readlineSync.question('Enter the plain password to encrypt: ', { hideEchoBack: true });

const encryptedPassword = encrypt(password);
console.log('Encrypted Password:', encryptedPassword);


