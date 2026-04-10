const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function deriveKey(passphrase) {
  return crypto.scryptSync(passphrase, 'snapenv-salt', KEY_LENGTH);
}

function encryptSnapshot(vars, passphrase) {
  const key = deriveKey(passphrase);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const plaintext = JSON.stringify(vars);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted.toString('hex'),
    encrypted: true
  };
}

function decryptSnapshot(payload, passphrase) {
  if (!payload.encrypted) {
    throw new Error('Snapshot is not encrypted');
  }

  const key = deriveKey(passphrase);
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.tag, 'hex');
  const data = Buffer.from(payload.data, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted;
  try {
    decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final()
    ]).toString('utf8');
  } catch (err) {
    throw new Error('Decryption failed: invalid passphrase or corrupted data');
  }

  return JSON.parse(decrypted);
}

function isEncrypted(payload) {
  return payload && payload.encrypted === true;
}

module.exports = { encryptSnapshot, decryptSnapshot, isEncrypted };
