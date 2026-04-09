const { listSnapshots } = require('./snapshot');
const path = require('path');
const fs = require('fs');

/**
 * Get metadata for a snapshot (creation time, key count)
 */
function getSnapshotMeta(snapshotPath) {
  try {
    const stat = fs.statSync(snapshotPath);
    const raw = fs.readFileSync(snapshotPath, 'utf8');
    const lines = raw.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    return {
      createdAt: stat.mtime,
      keyCount: lines.length,
    };
  } catch {
    return { createdAt: null, keyCount: 0 };
  }
}

/**
 * List all snapshots with optional metadata
 */
function listSnapshotsWithMeta(projectDir) {
  const names = listSnapshots(projectDir);
  return names.map(name => {
    const snapshotPath = path.join(projectDir, '.snapenv', `${name}.env`);
    const meta = getSnapshotMeta(snapshotPath);
    return { name, ...meta };
  });
}

/**
 * Format snapshot list for display
 */
function formatSnapshotList(snapshots) {
  if (snapshots.length === 0) {
    return 'No snapshots found.';
  }

  const lines = ['Snapshots:'];
  for (const snap of snapshots) {
    const date = snap.createdAt
      ? snap.createdAt.toLocaleString()
      : 'unknown date';
    lines.push(`  • ${snap.name}  (${snap.keyCount} keys, saved ${date})`);
  }
  return lines.join('\n');
}

module.exports = { listSnapshotsWithMeta, formatSnapshotList, getSnapshotMeta };
