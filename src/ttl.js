const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath } = require('./snapshot');

function getTtlPath(baseDir) {
  return path.join(baseDir || ensureSnapenvDir(), 'ttl.json');
}

function loadTtl(baseDir) {
  const ttlPath = getTtlPath(baseDir);
  if (!fs.existsSync(ttlPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(ttlPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveTtl(ttl, baseDir) {
  const ttlPath = getTtlPath(baseDir);
  fs.writeFileSync(ttlPath, JSON.stringify(ttl, null, 2));
}

function setTtl(name, durationMs, baseDir) {
  const ttl = loadTtl(baseDir);
  ttl[name] = { expiresAt: Date.now() + durationMs, setAt: Date.now() };
  saveTtl(ttl, baseDir);
  return ttl[name];
}

function removeTtl(name, baseDir) {
  const ttl = loadTtl(baseDir);
  if (!ttl[name]) return false;
  delete ttl[name];
  saveTtl(ttl, baseDir);
  return true;
}

function getTtl(name, baseDir) {
  const ttl = loadTtl(baseDir);
  return ttl[name] || null;
}

function isExpired(name, baseDir) {
  const entry = getTtl(name, baseDir);
  if (!entry) return false;
  return Date.now() > entry.expiresAt;
}

function getExpiredSnapshots(baseDir) {
  const ttl = loadTtl(baseDir);
  return Object.entries(ttl)
    .filter(([, entry]) => Date.now() > entry.expiresAt)
    .map(([name]) => name);
}

function formatTtlStatus(name, entry) {
  if (!entry) return `${name}: no TTL set`;
  const remaining = entry.expiresAt - Date.now();
  if (remaining <= 0) return `${name}: expired`;
  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${name}: expires in ${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${name}: expires in ${minutes}m ${seconds % 60}s`;
  return `${name}: expires in ${seconds}s`;
}

module.exports = {
  getTtlPath,
  loadTtl,
  saveTtl,
  setTtl,
  removeTtl,
  getTtl,
  isExpired,
  getExpiredSnapshots,
  formatTtlStatus,
};
