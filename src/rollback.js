const { loadHistory } = require('./history');
const { loadSnapshot, saveSnapshot, getSnapshotPath } = require('./snapshot');
const { restoreSnapshot } = require('./restore');
const fs = require('fs');

/**
 * Get the previous snapshot name for a given snapshot from history.
 */
function getPreviousSnapshot(snapshotName, history) {
  const relevant = history.filter(
    (entry) => entry.action === 'restore' && entry.target === snapshotName
  );
  if (relevant.length === 0) return null;
  // Most recent restore action before the current one
  const sorted = relevant.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return sorted[0].previous || null;
}

/**
 * Find the last snapshot that was active before the given one.
 */
function findRollbackTarget(snapshotName, snapenvDir) {
  const history = loadHistory(snapenvDir);
  // Look for restore events where target === snapshotName
  const restoreEvents = history.filter(
    (e) => e.action === 'restore' && e.snapshot === snapshotName
  );
  if (restoreEvents.length === 0) return null;
  restoreEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return restoreEvents[0].previous || null;
}

/**
 * Perform a rollback: restore the snapshot that was active before the given one.
 */
function rollbackSnapshot(snapshotName, envFilePath, snapenvDir) {
  const target = findRollbackTarget(snapshotName, snapenvDir);
  if (!target) {
    return { success: false, reason: 'No rollback target found in history.' };
  }
  const snapshotPath = getSnapshotPath(snapenvDir, target);
  if (!fs.existsSync(snapshotPath)) {
    return { success: false, reason: `Rollback target snapshot "${target}" not found.` };
  }
  restoreSnapshot(target, envFilePath, snapenvDir);
  return { success: true, rolledBackTo: target };
}

/**
 * Format rollback result for CLI output.
 */
function formatRollbackResult(result) {
  if (!result.success) {
    return `Rollback failed: ${result.reason}`;
  }
  return `Rolled back to snapshot: ${result.rolledBackTo}`;
}

module.exports = { findRollbackTarget, rollbackSnapshot, formatRollbackResult };
