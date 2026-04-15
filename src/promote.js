const { loadSnapshot, saveSnapshot, listSnapshots } = require('./snapshot');

/**
 * Promote a snapshot from one environment to another.
 * e.g. promote 'staging' snapshot to 'production' slot
 */
function promoteSnapshot(srcName, destName, snapenvDir) {
  const vars = loadSnapshot(srcName, snapenvDir);
  if (!vars) {
    throw new Error(`Snapshot '${srcName}' not found`);
  }
  const existing = listSnapshots(snapenvDir);
  const overwrote = existing.includes(destName);
  saveSnapshot(destName, vars, snapenvDir);
  return { srcName, destName, vars, overwrote };
}

function buildPromoteSummary(result) {
  return {
    srcName: result.srcName,
    destName: result.destName,
    keyCount: Object.keys(result.vars).length,
    overwrote: result.overwrote,
  };
}

function formatPromoteResult(summary) {
  const lines = [];
  lines.push(`Promoted '${summary.srcName}' → '${summary.destName}'`);
  lines.push(`  Keys copied : ${summary.keyCount}`);
  if (summary.overwrote) {
    lines.push(`  Warning     : '${summary.destName}' was overwritten`);
  }
  return lines.join('\n');
}

module.exports = { promoteSnapshot, buildPromoteSummary, formatPromoteResult };
