const CryptoError = require('./cryptoError');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = process.env.cipherKey;

function encrypt(text) {
  console.log('encrypt.service.encrypt', 'process started');
  let cipher = crypto.createCipher('aes-128-cbc', key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex')
  console.log('encrypt.service.encrypt', 'process completed');
  return encrypted;
}

function decrypt(text) {
  console.log('encrypt.service.decrypt', 'process started');
  let decipher = '';
  try {
    let decipher = crypto.createDecipher('aes-128-cbc', key);
    decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
  } catch (error) {
    throw new CryptoError(error.message);
  }
  console.log('encrypt.service.decrypt', 'process completed');
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
}