const { loadSnapshot } = require('./snapshot');
const { parseEnvFile } = require('./env');
const path = require('path');
const fs = require('fs');

/**
 * Inspect a snapshot and return its parsed key/value pairs with metadata
 */
function inspectSnapshot(name, projectDir = process.cwd()) {
  const data = loadSnapshot(name, projectDir);
  const keys = Object.keys(data.vars);
  return {
    name,
    createdAt: data.createdAt,
    keyCount: keys.length,
    vars: data.vars,
  };
}

/**
 * Filter snapshot vars by a search term (key or value substring)
 */
function filterVars(vars, search) {
  if (!search) return vars;
  const lower = search.toLowerCase();
  return Object.fromEntries(
    Object.entries(vars).filter(
      ([k, v]) =>
        k.toLowerCase().includes(lower) ||
        String(v).toLowerCase().includes(lower)
    )
  );
}

/**
 * Format the inspect result as a human-readable string
 */
function formatInspect(inspectResult, search = null) {
  const { name, createdAt, keyCount, vars } = inspectResult;
  const filtered = filterVars(vars, search);
  const filteredKeys = Object.keys(filtered);

  const lines = [];
  lines.push(`Snapshot: ${name}`);
  lines.push(`Created:  ${new Date(createdAt).toLocaleString()}`);
  lines.push(`Keys:     ${keyCount}${search ? ` (${filteredKeys.length} matching "${search}")` : ''}`);
  lines.push('');

  if (filteredKeys.length === 0) {
    lines.push('  (no matching keys)');
  } else {
    const maxLen = Math.max(...filteredKeys.map((k) => k.length));
    for (const key of filteredKeys.sort()) {
      const val = filtered[key];
      const masked = key.toLowerCase().includes('secret') || key.toLowerCase().includes('password')
        ? '********'
        : val;
      lines.push(`  ${key.padEnd(maxLen)}  =  ${masked}`);
    }
  }

  return lines.join('\n');
}

module.exports = { inspectSnapshot, filterVars, formatInspect };
