// encrypt_password.js
const { encrypt } = require('./config');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the plain password to encrypt: ', (password) => {
  const encryptedPassword = encrypt(password);
  console.log('Encrypted Password:', encryptedPassword);
  rl.close();
});


