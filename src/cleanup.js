const fs = require('fs');
const path = require('path');
const { listSnapshots, getSnapshotPath } = require('./snapshot');
const { isPinned } = require('./pin');
const { getTagsForSnapshot } = require('./tag');

function getOrphanedSnapshots(snapenvDir) {
  const snapshots = listSnapshots(snapenvDir);
  return snapshots.filter(name => {
    const snapPath = getSnapshotPath(snapenvDir, name);
    try {
      const stat = fs.statSync(snapPath);
      return !stat.isFile();
    } catch {
      return true;
    }
  });
}

function getUntaggedSnapshots(snapenvDir) {
  const snapshots = listSnapshots(snapenvDir);
  return snapshots.filter(name => {
    const tags = getTagsForSnapshot(snapenvDir, name);
    return !tags || tags.length === 0;
  });
}

function cleanupSnapshots(snapenvDir, options = {}) {
  const { dryRun = false, skipPinned = true, onlyUntagged = false } = options;
  const snapshots = onlyUntagged
    ? getUntaggedSnapshots(snapenvDir)
    : listSnapshots(snapenvDir);

  const removed = [];
  const skipped = [];

  for (const name of snapshots) {
    if (skipPinned && isPinned(snapenvDir, name)) {
      skipped.push({ name, reason: 'pinned' });
      continue;
    }
    if (!dryRun) {
      const snapPath = getSnapshotPath(snapenvDir, name);
      try {
        fs.unlinkSync(snapPath);
        removed.push(name);
      } catch (err) {
        skipped.push({ name, reason: err.message });
      }
    } else {
      removed.push(name);
    }
  }

  return { removed, skipped, dryRun };
}

function formatCleanupResult(result) {
  const lines = [];
  if (result.dryRun) lines.push('(dry run)');
  if (result.removed.length === 0) {
    lines.push('No snapshots removed.');
  } else {
    lines.push(`Removed ${result.removed.length} snapshot(s):`);
    result.removed.forEach(name => lines.push(`  - ${name}`));
  }
  if (result.skipped.length > 0) {
    lines.push(`Skipped ${result.skipped.length} snapshot(s):`);
    result.skipped.forEach(({ name, reason }) => lines.push(`  - ${name} (${reason})`));
  }
  return lines.join('\n');
}

module.exports = { getOrphanedSnapshots, getUntaggedSnapshots, cleanupSnapshots, formatCleanupResult };
