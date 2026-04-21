const { loadHistory } = require('./history');
const { loadSnapshot, saveSnapshot } = require('./snapshot');
const { recordAction } = require('./history');

/**
 * Find all snapshots applied within a time window
 */
function getReplayWindow(history, fromMs, toMs) {
  return history.filter(entry => {
    const t = new Date(entry.timestamp).getTime();
    return entry.action === 'restore' && t >= fromMs && t <= toMs;
  });
}

/**
 * Replay a snapshot by re-saving it under a new name
 */
async function replaySnapshot(snapenvDir, snapshotName, targetName) {
  const data = await loadSnapshot(snapenvDir, snapshotName);
  if (!data) {
    throw new Error(`Snapshot "${snapshotName}" not found`);
  }
  const existing = await loadSnapshot(snapenvDir, targetName).catch(() => null);
  if (existing) {
    throw new Error(`Target snapshot "${targetName}" already exists`);
  }
  await saveSnapshot(snapenvDir, targetName, data);
  await recordAction(snapenvDir, 'replay', { source: snapshotName, target: targetName });
  return { source: snapshotName, target: targetName, vars: Object.keys(data).length };
}

/**
 * Build a summary object for replay result
 */
function buildReplaySummary(result) {
  return {
    source: result.source,
    target: result.target,
    varCount: result.vars,
  };
}

/**
 * Format replay result for display
 */
function formatReplayResult(result) {
  const lines = [
    `Replayed snapshot "${result.source}" → "${result.target}"`,
    `  Variables copied: ${result.vars}`,
  ];
  return lines.join('\n');
}

module.exports = { getReplayWindow, replaySnapshot, buildReplaySummary, formatReplayResult };
