const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath } = require('./snapshot');

function getStampsPath(baseDir) {
  return path.join(ensureSnapenvDir(baseDir), 'stamps.json');
}

function loadStamps(baseDir) {
  const stampsPath = getStampsPath(baseDir);
  if (!fs.existsSync(stampsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(stampsPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveStamps(baseDir, stamps) {
  const stampsPath = getStampsPath(baseDir);
  fs.writeFileSync(stampsPath, JSON.stringify(stamps, null, 2));
}

function stampSnapshot(name, label, baseDir) {
  const snapshotPath = getSnapshotPath(name, baseDir);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${name}" not found`);
  }
  const stamps = loadStamps(baseDir);
  if (!stamps[name]) stamps[name] = [];
  const entry = { label, stampedAt: new Date().toISOString() };
  stamps[name].push(entry);
  saveStamps(baseDir, stamps);
  return entry;
}

function removeStamp(name, label, baseDir) {
  const stamps = loadStamps(baseDir);
  if (!stamps[name]) return false;
  const before = stamps[name].length;
  stamps[name] = stamps[name].filter(s => s.label !== label);
  if (stamps[name].length === before) return false;
  saveStamps(baseDir, stamps);
  return true;
}

function getStampsForSnapshot(name, baseDir) {
  const stamps = loadStamps(baseDir);
  return stamps[name] || [];
}

function findSnapshotsByStamp(label, baseDir) {
  const stamps = loadStamps(baseDir);
  return Object.entries(stamps)
    .filter(([, entries]) => entries.some(s => s.label === label))
    .map(([name]) => name);
}

function formatStampList(name, stamps) {
  if (!stamps.length) return `No stamps for "${name}".`;
  const lines = stamps.map(s => `  [${s.label}] stamped at ${s.stampedAt}`);
  return [`Stamps for "${name}":`, ...lines].join('\n');
}

module.exports = {
  getStampsPath,
  loadStamps,
  saveStamps,
  stampSnapshot,
  removeStamp,
  getStampsForSnapshot,
  findSnapshotsByStamp,
  formatStampList,
};
