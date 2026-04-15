const { loadSnapshot, saveSnapshot } = require('./snapshot');
const { getSnapshotMeta } = require('./list');

/**
 * Clone a snapshot to a new name, optionally into a different project dir.
 */
async function cloneSnapshot(name, newName, options = {}) {
  const { snapenvDir } = options;

  const source = await loadSnapshot(name, { snapenvDir });
  if (!source) {
    throw new Error(`Snapshot "${name}" not found`);
  }

  const existingMeta = await getSnapshotMeta(newName, { snapenvDir }).catch(() => null);
  if (existingMeta && !options.force) {
    throw new Error(`Snapshot "${newName}" already exists. Use --force to overwrite.`);
  }

  await saveSnapshot(newName, source.vars, { snapenvDir });

  return buildCloneSummary(name, newName, source.vars);
}

function buildCloneSummary(source, dest, vars) {
  return {
    source,
    dest,
    varCount: Object.keys(vars).length,
  };
}

function formatCloneResult(summary) {
  const lines = [
    `Cloned snapshot "${summary.source}" → "${summary.dest}"`,
    `  Variables copied: ${summary.varCount}`,
  ];
  return lines.join('\n');
}

module.exports = { cloneSnapshot, buildCloneSummary, formatCloneResult };
