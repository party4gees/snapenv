const fs = require('fs');
const path = require('path');
const { loadSnapshot, listSnapshots } = require('./snapshot');
const { parseEnvFile } = require('./env');
const { diffEnvVars } = require('./diff');
const { isPinned } = require('./pin');
const { isLocked } = require('./lock');

function getProjectEnvPath(dir = process.cwd()) {
  return path.join(dir, '.env');
}

function getActiveSnapshot(snapenvDir) {
  const activePath = path.join(snapenvDir, '.active');
  if (!fs.existsSync(activePath)) return null;
  return fs.readFileSync(activePath, 'utf8').trim() || null;
}

function setActiveSnapshot(snapenvDir, name) {
  const activePath = path.join(snapenvDir, '.active');
  fs.writeFileSync(activePath, name, 'utf8');
}

function clearActiveSnapshot(snapenvDir) {
  const activePath = path.join(snapenvDir, '.active');
  if (fs.existsSync(activePath)) fs.unlinkSync(activePath);
}

function getStatus(snapenvDir, envPath) {
  const snapshots = listSnapshots(snapenvDir);
  const active = getActiveSnapshot(snapenvDir);

  let envVars = {};
  if (fs.existsSync(envPath)) {
    envVars = parseEnvFile(envPath);
  }

  let drift = null;
  if (active) {
    const snap = loadSnapshot(snapenvDir, active);
    if (snap) {
      drift = diffEnvVars(snap, envVars);
    }
  }

  return {
    active,
    snapshotCount: snapshots.length,
    envExists: fs.existsSync(envPath),
    envVarCount: Object.keys(envVars).length,
    drift,
    hasDrift: drift ? (drift.added.length + drift.removed.length + drift.changed.length) > 0 : false,
  };
}

function formatStatus(status) {
  const lines = [];
  lines.push('snapenv status');
  lines.push('─'.repeat(30));
  lines.push(`Active snapshot : ${status.active || '(none)'}`);
  lines.push(`Snapshots saved : ${status.snapshotCount}`);
  lines.push(`Env file        : ${status.envExists ? `found (${status.envVarCount} vars)` : 'not found'}`);
  if (status.active && status.drift) {
    if (status.hasDrift) {
      lines.push(`Drift detected  : +${status.drift.added.length} added, -${status.drift.removed.length} removed, ~${status.drift.changed.length} changed`);
    } else {
      lines.push('Drift detected  : none (env matches active snapshot)');
    }
  }
  return lines.join('\n');
}

/**
 * Returns a short one-line summary of the current status, useful for
 * prompts or compact displays (e.g. shell integrations).
 *
 * Examples:
 *   "no snapshot active"
 *   "snapshot: production (clean)"
 *   "snapshot: production (drift: +1 -0 ~2)"
 */
function getStatusSummary(status) {
  if (!status.active) return 'no snapshot active';
  if (!status.hasDrift) return `snapshot: ${status.active} (clean)`;
  const { added, removed, changed } = status.drift;
  return `snapshot: ${status.active} (drift: +${added.length} -${removed.length} ~${changed.length})`;
}

module.exports = { getActiveSnapshot, setActiveSnapshot, clearActiveSnapshot, getStatus, formatStatus, getStatusSummary, getProjectEnvPath };
