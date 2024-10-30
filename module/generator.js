const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const genToken = bytes => crypto.randomBytes(bytes).toString('hex');

const generateUUID = () => uuidv4();
const generate6CharToken = () => genToken(3).slice(0, 6);
const generate32BitToken = () => genToken(4);
const generate64BitToken = () => genToken(8);
const generate128BitToken = () => genToken(16);
const generate256BitToken = () => genToken(32);
const generate512BitToken = () => genToken(64);

module.exports = {
    generateUUID,
    generate6CharToken,
    generate32BitToken,
    generate64BitToken,
    generate128BitToken,
    generate256BitToken,
    generate512BitToken
};
