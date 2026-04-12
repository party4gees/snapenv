const { loadSnapshot } = require('./snapshot');
const { mergeEnvVars } = require('./merge');
const { saveSnapshot } = require('./snapshot');

/**
 * Load and merge multiple snapshots in order (left to right, later overrides earlier)
 */
function chainSnapshots(names, snapenvDir) {
  if (!names || names.length === 0) {
    throw new Error('At least one snapshot name is required');
  }

  let merged = {};
  const loaded = [];

  for (const name of names) {
    const vars = loadSnapshot(name, snapenvDir);
    merged = mergeEnvVars(merged, vars);
    loaded.push(name);
  }

  return { merged, loaded };
}

/**
 * Save a chained merge result as a new snapshot
 */
function saveChain(targetName, names, snapenvDir) {
  const { merged, loaded } = chainSnapshots(names, snapenvDir);
  saveSnapshot(targetName, merged, snapenvDir);
  return { targetName, sources: loaded, count: Object.keys(merged).length };
}

/**
 * Format chain result for display
 */
function formatChainResult(result) {
  const lines = [];
  lines.push(`Chained ${result.sources.length} snapshot(s) into "${result.targetName}":`);
  result.sources.forEach((name, i) => {
    lines.push(`  ${i + 1}. ${name}`);
  });
  lines.push(`Total keys: ${result.count}`);
  return lines.join('\n');
}

module.exports = { chainSnapshots, saveChain, formatChainResult };
