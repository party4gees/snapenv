const { loadSnapshot } = require('./snapshot');
const { restoreSnapshot } = require('./restore');
const { saveSnapshot } = require('./snapshot');

/**
 * Run a named operation on multiple snapshots
 * @param {string[]} names - snapshot names
 * @param {Function} fn - async fn(name) => result
 * @returns {Promise<BatchResult[]>}
 */
async function batchOperate(names, fn) {
  const results = [];
  for (const name of names) {
    try {
      const result = await fn(name);
      results.push({ name, success: true, result });
    } catch (err) {
      results.push({ name, success: false, error: err.message });
    }
  }
  return results;
}

/**
 * Delete multiple snapshots by name
 */
async function batchDelete(names, snapenvDir) {
  const { deleteSnapshot } = require('./prune');
  return batchOperate(names, (name) => deleteSnapshot(name, snapenvDir));
}

/**
 * Restore multiple snapshots in sequence (last one wins)
 */
async function batchRestore(names, envPath, snapenvDir) {
  return batchOperate(names, (name) => restoreSnapshot(name, envPath, snapenvDir));
}

/**
 * Format batch results into a human-readable summary
 * @param {BatchResult[]} results
 * @param {string} operation
 * @returns {string}
 */
function formatBatchResult(results, operation = 'operated on') {
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const lines = [`Batch ${operation}: ${succeeded.length} succeeded, ${failed.length} failed`];
  for (const r of succeeded) {
    lines.push(`  ✓ ${r.name}`);
  }
  for (const r of failed) {
    lines.push(`  ✗ ${r.name}: ${r.error}`);
  }
  return lines.join('\n');
}

module.exports = { batchOperate, batchDelete, batchRestore, formatBatchResult };
