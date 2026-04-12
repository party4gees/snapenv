const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath, loadSnapshot } = require('./snapshot');

function getRelayPath(snapenvDir) {
  return path.join(snapenvDir, 'relay.json');
}

function loadRelayConfig(snapenvDir) {
  const relayPath = getRelayPath(snapenvDir);
  if (!fs.existsSync(relayPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(relayPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveRelayConfig(snapenvDir, config) {
  const relayPath = getRelayPath(snapenvDir);
  fs.writeFileSync(relayPath, JSON.stringify(config, null, 2));
}

function setRelay(snapenvDir, name, targetProject) {
  const config = loadRelayConfig(snapenvDir);
  config[name] = { targetProject, createdAt: new Date().toISOString() };
  saveRelayConfig(snapenvDir, config);
  return config[name];
}

function removeRelay(snapenvDir, name) {
  const config = loadRelayConfig(snapenvDir);
  if (!config[name]) return false;
  delete config[name];
  saveRelayConfig(snapenvDir, config);
  return true;
}

function getRelay(snapenvDir, name) {
  const config = loadRelayConfig(snapenvDir);
  return config[name] || null;
}

function listRelays(snapenvDir) {
  return loadRelayConfig(snapenvDir);
}

function resolveRelaySnapshot(snapenvDir, name) {
  const relay = getRelay(snapenvDir, name);
  if (!relay) throw new Error(`Relay '${name}' not found`);
  const targetPath = getSnapshotPath(relay.targetProject, name);
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Relay target snapshot not found at: ${targetPath}`);
  }
  return loadSnapshot(relay.targetProject, name);
}

function formatRelayList(relays) {
  const entries = Object.entries(relays);
  if (entries.length === 0) return 'No relays configured.';
  return entries
    .map(([name, info]) => `  ${name} -> ${info.targetProject} (created ${info.createdAt.slice(0, 10)})`)
    .join('\n');
}

module.exports = {
  getRelayPath,
  loadRelayConfig,
  saveRelayConfig,
  setRelay,
  removeRelay,
  getRelay,
  listRelays,
  resolveRelaySnapshot,
  formatRelayList,
};
