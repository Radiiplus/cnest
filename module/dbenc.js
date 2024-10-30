const fs = require('fs'), path = require('path'), crypto = require('crypto');
const publicKey = fs.readFileSync(path.resolve(__dirname, '../data/dbk/public.pem'), 'utf8');
const privateKey = fs.readFileSync(path.resolve(__dirname, '../data/dbk/private.pem'), 'utf8');

const encrypt = message => crypto.publicEncrypt(publicKey, Buffer.from(message)).toString('base64');
const decrypt = encryptedMessage => crypto.privateDecrypt(privateKey, Buffer.from(encryptedMessage, 'base64')).toString('utf8');

module.exports = { encrypt, decrypt };