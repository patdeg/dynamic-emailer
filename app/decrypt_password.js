/**
 * @file decrypt_password.js
 * @description Utility script to decrypt passwords using the decryption function for testing/debugging.
 */

const { decrypt } = require('./encrypt'); // Import the decrypt function
const readline = require('readline');
const dotenv = require('dotenv');
const path = require('path');

// Load .env variables
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Adjust path if necessary

// Prompt for the encrypted password
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the encrypted password to decrypt: ', (encryptedPassword) => {
  try {
    const decryptedPassword = decrypt(encryptedPassword);
    console.log('Decrypted Password:', decryptedPassword);
  } catch (error) {
    console.error('Error decrypting password:', error);
  }
  rl.close();
});


