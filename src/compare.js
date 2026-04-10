const { loadSnapshot } = require('./snapshot');

/**
 * Compare two snapshots and return added, removed, changed keys
 */
function compareSnapshots(snapshotA, snapshotB) {
  const keysA = new Set(Object.keys(snapshotA));
  const keysB = new Set(Object.keys(snapshotB));

  const added = {};
  const removed = {};
  const changed = {};
  const unchanged = {};

  for (const key of keysB) {
    if (!keysA.has(key)) {
      added[key] = snapshotB[key];
    }
  }

  for (const key of keysA) {
    if (!keysB.has(key)) {
      removed[key] = snapshotA[key];
    } else if (snapshotA[key] !== snapshotB[key]) {
      changed[key] = { from: snapshotA[key], to: snapshotB[key] };
    } else {
      unchanged[key] = snapshotA[key];
    }
  }

  return { added, removed, changed, unchanged };
}

function formatCompareResult(nameA, nameB, result) {
  const lines = [];
  lines.push(`Comparing "${nameA}" → "${nameB}":`);
  lines.push('');

  const addedKeys = Object.keys(result.added);
  const removedKeys = Object.keys(result.removed);
  const changedKeys = Object.keys(result.changed);
  const unchangedCount = Object.keys(result.unchanged).length;

  if (addedKeys.length === 0 && removedKeys.length === 0 && changedKeys.length === 0) {
    lines.push('  No differences found.');
    lines.push(`  ${unchangedCount} key(s) identical.`);
    return lines.join('\n');
  }

  for (const key of addedKeys) {
    lines.push(`  + ${key}=${result.added[key]}`);
  }
  for (const key of removedKeys) {
    lines.push(`  - ${key}=${result.removed[key]}`);
  }
  for (const key of changedKeys) {
    lines.push(`  ~ ${key}: "${result.changed[key].from}" → "${result.changed[key].to}"`);
  }

  lines.push('');
  lines.push(
    `  +${addedKeys.length} added, -${removedKeys.length} removed, ~${changedKeys.length} changed, ${unchangedCount} unchanged`
  );

  return lines.join('\n');
}

async function compareTwoSnapshots(nameA, nameB) {
  const snapshotA = await loadSnapshot(nameA);
  const snapshotB = await loadSnapshot(nameB);
  return compareSnapshots(snapshotA, snapshotB);
}

module.exports = { compareSnapshots, compareTwoSnapshots, formatCompareResult };
