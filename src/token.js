const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ensureSnapenvDir } = require('./snapshot');

function getTokensPath(baseDir) {
  return path.join(baseDir || ensureSnapenvDir(), 'tokens.json');
}

function loadTokens(baseDir) {
  const p = getTokensPath(baseDir);
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveTokens(tokens, baseDir) {
  const p = getTokensPath(baseDir);
  fs.writeFileSync(p, JSON.stringify(tokens, null, 2));
}

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

function createToken(label, snapshotName, expiresInDays, baseDir) {
  const tokens = loadTokens(baseDir);
  const id = generateToken();
  const now = Date.now();
  const expiresAt = expiresInDays ? now + expiresInDays * 86400000 : null;
  tokens[id] = { label, snapshotName, createdAt: now, expiresAt };
  saveTokens(tokens, baseDir);
  return { id, label, snapshotName, createdAt: now, expiresAt };
}

function revokeToken(id, baseDir) {
  const tokens = loadTokens(baseDir);
  if (!tokens[id]) return false;
  delete tokens[id];
  saveTokens(tokens, baseDir);
  return true;
}

function resolveToken(id, baseDir) {
  const tokens = loadTokens(baseDir);
  const token = tokens[id];
  if (!token) return null;
  if (token.expiresAt && Date.now() > token.expiresAt) return null;
  return token;
}

function listTokens(baseDir) {
  const tokens = loadTokens(baseDir);
  return Object.entries(tokens).map(([id, meta]) => ({ id, ...meta }));
}

function formatTokenList(tokens) {
  if (!tokens.length) return 'No tokens found.';
  return tokens.map(t => {
    const expired = t.expiresAt && Date.now() > t.expiresAt ? ' [EXPIRED]' : '';
    const exp = t.expiresAt ? new Date(t.expiresAt).toISOString() : 'never';
    return `  ${t.id.slice(0, 12)}...  label=${t.label}  snapshot=${t.snapshotName}  expires=${exp}${expired}`;
  }).join('\n');
}

module.exports = { getTokensPath, loadTokens, saveTokens, createToken, revokeToken, resolveToken, listTokens, formatTokenList };
