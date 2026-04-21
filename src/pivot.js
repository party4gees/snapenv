const { loadSnapshot } = require('./snapshot');
const { listSnapshotsWithMeta } = require('./list');

/**
 * Build a pivot table: rows = snapshot names, cols = env var keys, values = var values
 */
function buildPivotTable(snapshots, vars) {
  const rows = [];
  for (const snap of snapshots) {
    const row = { name: snap.name };
    for (const key of vars) {
      row[key] = snap.vars[key] !== undefined ? snap.vars[key] : '';
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Collect all unique keys across a set of loaded snapshots
 */
function collectKeys(snapshots) {
  const keys = new Set();
  for (const snap of snapshots) {
    for (const key of Object.keys(snap.vars)) {
      keys.add(key);
    }
  }
  return Array.from(keys).sort();
}

/**
 * Load multiple snapshots and attach their vars
 */
async function loadSnapshotsForPivot(snapDir, names) {
  const results = [];
  for (const name of names) {
    const vars = await loadSnapshot(snapDir, name);
    results.push({ name, vars: vars || {} });
  }
  return results;
}

/**
 * Format pivot table as a plain-text grid
 */
function formatPivotTable(rows, keys) {
  if (rows.length === 0 || keys.length === 0) return 'No data to display.';

  const colWidth = (arr) => Math.max(...arr.map((s) => String(s).length));
  const nameWidth = colWidth([...rows.map((r) => r.name), 'SNAPSHOT']);
  const keyWidths = keys.map((k) =>
    colWidth([k, ...rows.map((r) => r[k])])
  );

  const pad = (s, w) => String(s).padEnd(w);
  const header = [pad('SNAPSHOT', nameWidth), ...keys.map((k, i) => pad(k, keyWidths[i]))].join('  ');
  const divider = '-'.repeat(header.length);

  const dataRows = rows.map((row) =>
    [pad(row.name, nameWidth), ...keys.map((k, i) => pad(row[k], keyWidths[i]))].join('  ')
  );

  return [header, divider, ...dataRows].join('\n');
}

module.exports = { buildPivotTable, collectKeys, loadSnapshotsForPivot, formatPivotTable };
