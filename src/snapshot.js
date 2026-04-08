const fs = require('fs');
const path = require('path');
const os = require('os');

const SNAPENV_DIR = path.join(os.homedir(), '.snapenv');

function ensureSnapenvDir() {
  if (!fs.existsSync(SNAPENV_DIR)) {
    fs.mkdirSync(SNAPENV_DIR, { recursive: true });
  }
}

function getSnapshotPath(name) {
  return path.join(SNAPENV_DIR, `${name}.json`);
}

function saveSnapshot(name, envVars) {
  ensureSnapenvDir();
  const snapshotPath = getSnapshotPath(name);
  const snapshot = {
    name,
    createdAt: new Date().toISOString(),
    env: envVars,
  };
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  return snapshotPath;
}

function loadSnapshot(name) {
  const snapshotPath = getSnapshotPath(name);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${name}" not found.`);
  }
  const raw = fs.readFileSync(snapshotPath, 'utf-8');
  return JSON.parse(raw);
}

function listSnapshots() {
  ensureSnapenvDir();
  const files = fs.readdirSync(SNAPENV_DIR);
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(SNAPENV_DIR, f), 'utf-8');
      const snap = JSON.parse(raw);
      return { name: snap.name, createdAt: snap.createdAt };
    });
}

function deleteSnapshot(name) {
  const snapshotPath = getSnapshotPath(name);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${name}" not found.`);
  }
  fs.unlinkSync(snapshotPath);
}

module.exports = { saveSnapshot, loadSnapshot, listSnapshots, deleteSnapshot, SNAPENV_DIR };
