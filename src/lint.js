const fs = require('fs');
const path = require('path');
const { loadSnapshot } = require('./snapshot');

const RULES = {
  no_empty_value: (key, val) => val.trim() === '' ? `'${key}' has an empty value` : null,
  no_whitespace_key: (key) => /\s/.test(key) ? `'${key}' contains whitespace in key name` : null,
  no_quotes_in_value: (key, val) => /^['"].*['"]$/.test(val.trim()) ? `'${key}' value is wrapped in quotes (may cause issues)` : null,
  no_duplicate_key: () => null, // handled separately
};

function lintSnapshot(name, snapenvDir) {
  const vars = loadSnapshot(name, snapenvDir);
  if (!vars) throw new Error(`Snapshot '${name}' not found`);

  const warnings = [];
  const seen = new Set();

  for (const [key, val] of Object.entries(vars)) {
    if (seen.has(key)) {
      warnings.push({ key, rule: 'no_duplicate_key', message: `'${key}' is duplicated` });
    }
    seen.add(key);

    for (const [ruleName, ruleFn] of Object.entries(RULES)) {
      if (ruleName === 'no_duplicate_key') continue;
      const msg = ruleFn(key, val);
      if (msg) warnings.push({ key, rule: ruleName, message: msg });
    }
  }

  return warnings;
}

function formatLintResult(name, warnings) {
  if (warnings.length === 0) {
    return `✔  Snapshot '${name}' passed all lint checks.`;
  }
  const lines = [`✖  Snapshot '${name}' has ${warnings.length} lint warning(s):`, ''];
  for (const w of warnings) {
    lines.push(`  [${w.rule}] ${w.message}`);
  }
  return lines.join('\n');
}

module.exports = { lintSnapshot, formatLintResult, RULES };
