const { loadSnapshot } = require('./snapshot');

/**
 * Collect all unique keys across multiple snapshots.
 */
function collectKeys(snapshots) {
  const keys = new Set();
  for (const snap of snapshots) {
    for (const key of Object.keys(snap.vars || {})) {
      keys.add(key);
    }
  }
  return Array.from(keys).sort();
}

/**
 * Build a pivot table: rows = keys, columns = snapshot names.
 * @param {Array<{name: string, vars: object}>} snapshots
 * @returns {{ keys: string[], columns: string[], rows: object[] }}
 */
function buildPivotTable(snapshots) {
  const keys = collectKeys(snapshots);
  const columns = snapshots.map((s) => s.name);

  const rows = keys.map((key) => {
    const row = { key };
    for (const snap of snapshots) {
      row[snap.name] = (snap.vars || {})[key] !== undefined ? (snap.vars || {})[key] : null;
    }
    return row;
  });

  return { keys, columns, rows };
}

/**
 * Format a pivot table for terminal output.
 */
function formatPivotTable({ keys, columns, rows }) {
  if (!keys.length) return 'No variables found.';

  const colWidth = 20;
  const keyWidth = Math.max(12, ...keys.map((k) => k.length)) + 2;

  const header =
    'KEY'.padEnd(keyWidth) +
    columns.map((c) => c.slice(0, colWidth - 2).padEnd(colWidth)).join('');

  const divider = '-'.repeat(keyWidth + columns.length * colWidth);

  const body = rows
    .map((row) => {
      const keyCell = row.key.padEnd(keyWidth);
      const valueCells = columns
        .map((c) => {
          const val = row[c] === null ? '—' : String(row[c]).slice(0, colWidth - 2);
          return val.padEnd(colWidth);
        })
        .join('');
      return keyCell + valueCells;
    })
    .join('\n');

  return [header, divider, body].join('\n');
}

module.exports = { buildPivotTable, collectKeys, formatPivotTable };
