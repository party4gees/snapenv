const fs = require('fs');
const path = require('path');
const { ensureSnapenvDir, getSnapshotPath, listSnapshots } = require('./snapshot');

/**
 * Delete a single snapshot by name
 */
function deleteSnapshot(name) {
  const snapshotPath = getSnapshotPath(name);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${name}" does not exist`);
  }
  fs.unlinkSync(snapshotPath);
  return { deleted: [name] };
}

/**
 * Delete all snapshots older than a given date
 */
function pruneByAge(olderThanMs) {
  const snapshots = listSnapshots();
  const cutoff = Date.now() - olderThanMs;
  const deleted = [];

  for (const name of snapshots) {
    const snapshotPath = getSnapshotPath(name);
    const stat = fs.statSync(snapshotPath);
    if (stat.mtimeMs < cutoff) {
      fs.unlinkSync(snapshotPath);
      deleted.push(name);
    }
  }

  return { deleted };
}

/**
 * Keep only the N most recent snapshots, delete the rest
 */
function pruneKeepLatest(keepCount) {
  const snapshots = listSnapshots();
  if (snapshots.length <= keepCount) {
    return { deleted: [] };
  }

  const withMtime = snapshots.map(name => {
    const snapshotPath = getSnapshotPath(name);
    const stat = fs.statSync(snapshotPath);
    return { name, mtime: stat.mtimeMs };
  });

  withMtime.sort((a, b) => b.mtime - a.mtime);
  const toDelete = withMtime.slice(keepCount);
  const deleted = [];

  for (const { name } of toDelete) {
    fs.unlinkSync(getSnapshotPath(name));
    deleted.push(name);
  }

  return { deleted };
}

/**
 * Format a prune result summary for display
 */
function formatPruneSummary(result) {
  if (result.deleted.length === 0) {
    return 'No snapshots were removed.';
  }
  const lines = [`Removed ${result.deleted.length} snapshot(s):`];
  for (const name of result.deleted) {
    lines.push(`  - ${name}`);
  }
  return lines.join('\n');
}

module.exports = { deleteSnapshot, pruneByAge, pruneKeepLatest, formatPruneSummary };
