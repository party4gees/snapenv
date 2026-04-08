/**
 * Merge utilities for combining env var sets
 */

/**
 * Merge strategy options:
 *   - 'ours'   : keep current values on conflict
 *   - 'theirs' : use snapshot values on conflict
 *   - 'ask'    : not handled here, caller must resolve
 */

/**
 * Merge two env var objects.
 * @param {Record<string,string>} base - current env vars
 * @param {Record<string,string>} incoming - snapshot env vars
 * @param {'ours'|'theirs'} strategy
 * @returns {{ merged: Record<string,string>, conflicts: string[] }}
 */
function mergeEnvVars(base, incoming, strategy = 'theirs') {
  const merged = { ...base };
  const conflicts = [];

  for (const [key, value] of Object.entries(incoming)) {
    if (key in base && base[key] !== value) {
      conflicts.push(key);
      if (strategy === 'theirs') {
        merged[key] = value;
      }
      // 'ours' keeps base value, already set
    } else {
      merged[key] = value;
    }
  }

  return { merged, conflicts };
}

/**
 * Apply only keys from incoming that are missing in base.
 * @param {Record<string,string>} base
 * @param {Record<string,string>} incoming
 * @returns {Record<string,string>}
 */
function applyMissingKeys(base, incoming) {
  const result = { ...base };
  for (const [key, value] of Object.entries(incoming)) {
    if (!(key in result)) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Produce a human-readable summary of a merge result.
 * @param {string[]} conflicts
 * @param {'ours'|'theirs'} strategy
 * @returns {string}
 */
function formatMergeSummary(conflicts, strategy) {
  if (conflicts.length === 0) {
    return 'Merge completed with no conflicts.';
  }
  const resolution = strategy === 'theirs' ? 'snapshot value used' : 'current value kept';
  const lines = [`${conflicts.length} conflict(s) resolved (${resolution}):`];
  for (const key of conflicts) {
    lines.push(`  ~ ${key}`);
  }
  return lines.join('\n');
}

module.exports = { mergeEnvVars, applyMissingKeys, formatMergeSummary };
