const { parseEnvFile } = require('./env');
const { loadSnapshot } = require('./snapshot');

/**
 * Compare two env var maps and return added, removed, and changed keys.
 * @param {Object} base - baseline env vars
 * @param {Object} current - current env vars
 * @returns {{ added: Object, removed: Object, changed: Object }}
 */
function diffEnvVars(base, current) {
  const added = {};
  const removed = {};
  const changed = {};

  for (const key of Object.keys(current)) {
    if (!(key in base)) {
      added[key] = current[key];
    } else if (base[key] !== current[key]) {
      changed[key] = { from: base[key], to: current[key] };
    }
  }

  for (const key of Object.keys(base)) {
    if (!(key in current)) {
      removed[key] = base[key];
    }
  }

  return { added, removed, changed };
}

/**
 * Compare a snapshot against the current .env file.
 * @param {string} snapshotName
 * @param {string} envFilePath
 * @returns {{ added: Object, removed: Object, changed: Object }}
 */
function diffSnapshotAgainstEnv(snapshotName, envFilePath) {
  const snapshotVars = loadSnapshot(snapshotName);
  const currentVars = parseEnvFile(envFilePath);
  return diffEnvVars(snapshotVars, currentVars);
}

/**
 * Format a diff result into a human-readable string.
 * @param {{ added: Object, removed: Object, changed: Object }} diff
 * @returns {string}
 */
function formatDiff(diff) {
  const lines = [];

  for (const [key, value] of Object.entries(diff.added)) {
    lines.push(`+ ${key}=${value}`);
  }

  for (const [key, value] of Object.entries(diff.removed)) {
    lines.push(`- ${key}=${value}`);
  }

  for (const [key, { from, to }] of Object.entries(diff.changed)) {
    lines.push(`~ ${key}: ${from} → ${to}`);
  }

  if (lines.length === 0) {
    return 'No differences found.';
  }

  return lines.join('\n');
}

module.exports = { diffEnvVars, diffSnapshotAgainstEnv, formatDiff };
