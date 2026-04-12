const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadSnapshot } = require('./snapshot');
const { exportToJson } = require('./export');

const SHARE_TOKEN_LENGTH = 24;

function generateShareToken() {
  return crypto.randomBytes(SHARE_TOKEN_LENGTH).toString('hex').slice(0, SHARE_TOKEN_LENGTH);
}

function getShareIndexPath(snapenvDir) {
  return path.join(snapenvDir, 'shares.json');
}

function loadShareIndex(snapenvDir) {
  const indexPath = getShareIndexPath(snapenvDir);
  if (!fs.existsSync(indexPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveShareIndex(snapenvDir, index) {
  const indexPath = getShareIndexPath(snapenvDir);
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
}

function createShareBundle(snapenvDir, snapshotName, options = {}) {
  const vars = loadSnapshot(snapenvDir, snapshotName);
  const token = generateShareToken();
  const createdAt = new Date().toISOString();
  const expiresAt = options.ttlHours
    ? new Date(Date.now() + options.ttlHours * 3600 * 1000).toISOString()
    : null;

  const bundle = {
    token,
    snapshotName,
    vars,
    createdAt,
    expiresAt,
    note: options.note || null
  };

  const index = loadShareIndex(snapenvDir);
  index[token] = { snapshotName, createdAt, expiresAt, note: bundle.note };
  saveShareIndex(snapenvDir, index);

  const bundlePath = path.join(snapenvDir, `share-${token}.json`);
  fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2));

  return { token, bundlePath, bundle };
}

function resolveShareBundle(snapenvDir, token) {
  const bundlePath = path.join(snapenvDir, `share-${token}.json`);
  if (!fs.existsSync(bundlePath)) return null;
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  if (bundle.expiresAt && new Date(bundle.expiresAt) < new Date()) {
    return { expired: true, bundle };
  }
  return { expired: false, bundle };
}

function revokeShareBundle(snapenvDir, token) {
  const bundlePath = path.join(snapenvDir, `share-${token}.json`);
  const existed = fs.existsSync(bundlePath);
  if (existed) fs.unlinkSync(bundlePath);
  const index = loadShareIndex(snapenvDir);
  const had = !!index[token];
  delete index[token];
  saveShareIndex(snapenvDir, index);
  return existed || had;
}

function listShares(snapenvDir) {
  return loadShareIndex(snapenvDir);
}

function formatShareSummary(token, bundle) {
  const lines = [
    `Token:    ${token}`,
    `Snapshot: ${bundle.snapshotName}`,
    `Created:  ${bundle.createdAt}`,
    `Expires:  ${bundle.expiresAt || 'never'}`,
  ];
  if (bundle.note) lines.push(`Note:     ${bundle.note}`);
  return lines.join('\n');
}

module.exports = {
  generateShareToken,
  getShareIndexPath,
  loadShareIndex,
  saveShareIndex,
  createShareBundle,
  resolveShareBundle,
  revokeShareBundle,
  listShares,
  formatShareSummary
};
