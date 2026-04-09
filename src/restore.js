const fs = require('fs');
const path = require('path');
const { loadSnapshot, listSnapshots } = require('./snapshot');
const { parseEnvFile, serializeEnvVars, writeEnvFile } = require('./env');

/**
 * Restore a snapshot to a target .env file.
 * Returns a summary of what changed.
 */
function restoreSnapshot(snapshotName, envFilePath = '.env') {
  const snapshot = loadSnapshot(snapshotName);
  if (!snapshot) {
    throw new Error(`Snapshot "${snapshotName}" not found.`);
  }

  const previous = fs.existsSync(envFilePath)
    ? parseEnvFile(envFilePath)
    : {};

  writeEnvFile(envFilePath, snapshot.vars);

  return buildRestoreSummary(previous, snapshot.vars, snapshotName, envFilePath);
}

/**
 * Build a human-readable summary of what the restore changed.
 */
function buildRestoreSummary(previous, restored, snapshotName, envFilePath) {
  const added = [];
  const removed = [];
  const changed = [];
  const unchanged = [];

  const allKeys = new Set([...Object.keys(previous), ...Object.keys(restored)]);

  for (const key of allKeys) {
    const hadBefore = key in previous;
    const hasAfter = key in restored;

    if (!hadBefore && hasAfter) {
      added.push(key);
    } else if (hadBefore && !hasAfter) {
      removed.push(key);
    } else if (previous[key] !== restored[key]) {
      changed.push(key);
    } else {
      unchanged.push(key);
    }
  }

  return { snapshotName, envFilePath, added, removed, changed, unchanged };
}

/**
 * Format a restore summary into a printable string.
 */
function formatRestoreSummary(summary) {
  const lines = [
    `Restored snapshot "${summary.snapshotName}" → ${summary.envFilePath}`,
    '',
  ];

  if (summary.added.length) lines.push(`  Added   (${summary.added.length}): ${summary.added.join(', ')}`);
  if (summary.removed.length) lines.push(`  Removed (${summary.removed.length}): ${summary.removed.join(', ')}`);
  if (summary.changed.length) lines.push(`  Changed (${summary.changed.length}): ${summary.changed.join(', ')}`);
  if (summary.unchanged.length) lines.push(`  Unchanged: ${summary.unchanged.length} key(s)`);

  if (!summary.added.length && !summary.removed.length && !summary.changed.length) {
    lines.push('  No changes — environment already matches snapshot.');
  }

  return lines.join('\n');
}

module.exports = { restoreSnapshot, buildRestoreSummary, formatRestoreSummary };
