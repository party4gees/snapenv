const { listSnapshotsWithMeta } = require('./list');
const { loadSnapshot } = require('./snapshot');

/**
 * Search snapshots by key name (checks if key exists in snapshot)
 */
async function searchByKey(snapenvDir, keyPattern) {
  const snapshots = await listSnapshotsWithMeta(snapenvDir);
  const regex = new RegExp(keyPattern, 'i');
  const results = [];

  for (const snap of snapshots) {
    const vars = await loadSnapshot(snapenvDir, snap.name);
    const matchingKeys = Object.keys(vars).filter(k => regex.test(k));
    if (matchingKeys.length > 0) {
      results.push({ snapshot: snap.name, keys: matchingKeys });
    }
  }

  return results;
}

/**
 * Search snapshots by value (checks if any value matches pattern)
 */
async function searchByValue(snapenvDir, valuePattern) {
  const snapshots = await listSnapshotsWithMeta(snapenvDir);
  const regex = new RegExp(valuePattern, 'i');
  const results = [];

  for (const snap of snapshots) {
    const vars = await loadSnapshot(snapenvDir, snap.name);
    const matchingKeys = Object.keys(vars).filter(k => regex.test(vars[k]));
    if (matchingKeys.length > 0) {
      results.push({ snapshot: snap.name, keys: matchingKeys });
    }
  }

  return results;
}

/**
 * Format search results for display
 */
function formatSearchResults(results, pattern) {
  if (results.length === 0) {
    return `No snapshots found matching "${pattern}".`;
  }

  const lines = [`Found matches for "${pattern}" in ${results.length} snapshot(s):\n`];
  for (const r of results) {
    lines.push(`  ${r.snapshot}`);
    for (const key of r.keys) {
      lines.push(`    - ${key}`);
    }
  }
  return lines.join('\n');
}

module.exports = { searchByKey, searchByValue, formatSearchResults };
