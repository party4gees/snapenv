const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath } = require('./snapshot');

const PINS_FILE = '.snapenv/pins.json';

function loadPinsFile() {
  ensureSnapenvDir();
  if (!fs.existsSync(PINS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(PINS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function savePinsFile(pins) {
  ensureSnapenvDir();
  fs.writeFileSync(PINS_FILE, JSON.stringify(pins, null, 2));
}

function pinSnapshot(name) {
  const snapshotPath = getSnapshotPath(name);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${name}" does not exist.`);
  }
  const pins = loadPinsFile();
  if (pins[name]) {
    throw new Error(`Snapshot "${name}" is already pinned.`);
  }
  pins[name] = { pinnedAt: new Date().toISOString() };
  savePinsFile(pins);
  return pins[name];
}

function unpinSnapshot(name) {
  const pins = loadPinsFile();
  if (!pins[name]) {
    throw new Error(`Snapshot "${name}" is not pinned.`);
  }
  delete pins[name];
  savePinsFile(pins);
}

function isPinned(name) {
  const pins = loadPinsFile();
  return !!pins[name];
}

function listPinnedSnapshots() {
  const pins = loadPinsFile();
  return Object.entries(pins).map(([name, meta]) => ({ name, ...meta }));
}

function formatPinList(pinned) {
  if (pinned.length === 0) return 'No pinned snapshots.';
  const lines = pinned.map(p => `  📌 ${p.name}  (pinned ${new Date(p.pinnedAt).toLocaleString()})`);
  return `Pinned snapshots:\n${lines.join('\n')}`;
}

module.exports = { loadPinsFile, savePinsFile, pinSnapshot, unpinSnapshot, isPinned, listPinnedSnapshots, formatPinList };
