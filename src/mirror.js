const fs = require('fs');
const path = require('path');
const { loadSnapshot } = require('./snapshot');
const { writeEnvFile } = require('./env');

/**
 * Mirror a snapshot's vars into one or more target .env files.
 * Existing keys in targets are overwritten; extra keys are left untouched.
 */
function mirrorSnapshot(snapshotName, targetPaths, snapenvDir) {
  const vars = loadSnapshot(snapshotName, snapenvDir);
  if (!vars) {
    throw new Error(`Snapshot "${snapshotName}" not found.`);
  }

  const results = [];

  for (const targetPath of targetPaths) {
    const resolved = path.resolve(targetPath);
    let existing = {};

    if (fs.existsSync(resolved)) {
      const raw = fs.readFileSync(resolved, 'utf8');
      const { parseEnvString } = require('./env');
      existing = parseEnvString(raw);
    }

    const merged = Object.assign({}, existing, vars);
    writeEnvFile(resolved, merged);

    results.push({
      target: resolved,
      applied: Object.keys(vars).length,
      created: !fs.existsSync(resolved),
    });
  }

  return results;
}

function formatMirrorResult(results, snapshotName) {
  const lines = [`Mirrored snapshot "${snapshotName}" to ${results.length} file(s):\n`];
  for (const r of results) {
    lines.push(`  ${r.target}  (${r.applied} vars applied)`);
  }
  return lines.join('\n');
}

module.exports = { mirrorSnapshot, formatMirrorResult };
