const { loadSnapshot, saveSnapshot } = require('./snapshot');

/**
 * Copy a snapshot to a new name
 * @param {string} sourceName - source snapshot name
 * @param {string} destName - destination snapshot name
 * @param {string} [projectDir] - project directory
 * @returns {object} result with source, dest, and keyCount
 */
async function copySnapshot(sourceName, destName, projectDir = process.cwd()) {
  if (!sourceName || !destName) {
    throw new Error('Both source and destination snapshot names are required');
  }

  if (sourceName === destName) {
    throw new Error('Source and destination snapshot names must be different');
  }

  const vars = await loadSnapshot(sourceName, projectDir);

  if (!vars || Object.keys(vars).length === 0) {
    throw new Error(`Snapshot "${sourceName}" not found or is empty`);
  }

  await saveSnapshot(destName, vars, projectDir);

  return {
    source: sourceName,
    dest: destName,
    keyCount: Object.keys(vars).length,
  };
}

/**
 * Format a copy result into a human-readable summary
 * @param {object} result
 * @returns {string}
 */
function formatCopySummary(result) {
  const lines = [
    `Copied snapshot "${result.source}" → "${result.dest}"`,
    `  ${result.keyCount} variable(s) copied`,
  ];
  return lines.join('\n');
}

module.exports = { copySnapshot, formatCopySummary };
