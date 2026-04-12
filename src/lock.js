const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath } = require('./snapshot');

function getLockFilePath(snapenvDir) {
  return path.join(snapenvDir, 'locks.json');
}

function loadLocks(snapenvDir) {
  const lockPath = getLockFilePath(snapenvDir);
  if (!fs.existsSync(lockPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveLocks(snapenvDir, locks) {
  const lockPath = getLockFilePath(snapenvDir);
  fs.writeFileSync(lockPath, JSON.stringify(locks, null, 2));
}

function lockSnapshot(snapenvDir, name, reason = '') {
  const snapshotPath = getSnapshotPath(snapenvDir, name);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${name}" does not exist`);
  }
  const locks = loadLocks(snapenvDir);
  if (locks[name]) {
    throw new Error(`Snapshot "${name}" is already locked`);
  }
  locks[name] = { lockedAt: new Date().toISOString(), reason };
  saveLocks(snapenvDir, locks);
  return locks[name];
}

function unlockSnapshot(snapenvDir, name) {
  const locks = loadLocks(snapenvDir);
  if (!locks[name]) {
    throw new Error(`Snapshot "${name}" is not locked`);
  }
  delete locks[name];
  saveLocks(snapenvDir, locks);
}

function isLocked(snapenvDir, name) {
  const locks = loadLocks(snapenvDir);
  return !!locks[name];
}

function getLockInfo(snapenvDir, name) {
  const locks = loadLocks(snapenvDir);
  return locks[name] || null;
}

function formatLockStatus(name, lockInfo) {
  if (!lockInfo) return `${name}: unlocked`;
  const reason = lockInfo.reason ? ` — ${lockInfo.reason}` : '';
  return `${name}: locked since ${lockInfo.lockedAt}${reason}`;
}

module.exports = {
  getLockFilePath,
  loadLocks,
  saveLocks,
  lockSnapshot,
  unlockSnapshot,
  isLocked,
  getLockInfo,
  formatLockStatus,
};
