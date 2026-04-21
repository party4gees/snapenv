const { buildPivotTable, collectKeys, formatPivotTable } = require('./pivot');

const snapA = { name: 'dev', vars: { NODE_ENV: 'development', PORT: '3000', DEBUG: 'true' } };
const snapB = { name: 'prod', vars: { NODE_ENV: 'production', PORT: '8080' } };
const snapC = { name: 'test', vars: { NODE_ENV: 'test', DEBUG: 'false', CI: '1' } };

describe('collectKeys', () => {
  test('collects unique keys across all snapshots', () => {
    const keys = collectKeys([snapA, snapB, snapC]);
    expect(keys).toContain('NODE_ENV');
    expect(keys).toContain('PORT');
    expect(keys).toContain('DEBUG');
    expect(keys).toContain('CI');
  });

  test('returns sorted keys', () => {
    const keys = collectKeys([snapA, snapB]);
    expect(keys).toEqual([...keys].sort());
  });

  test('returns empty array for empty snapshots', () => {
    expect(collectKeys([])).toEqual([]);
  });

  test('handles snapshots with no vars', () => {
    const keys = collectKeys([{ name: 'empty', vars: {} }]);
    expect(keys).toEqual([]);
  });
});

describe('buildPivotTable', () => {
  test('columns match snapshot names', () => {
    const { columns } = buildPivotTable([snapA, snapB]);
    expect(columns).toEqual(['dev', 'prod']);
  });

  test('rows contain correct values', () => {
    const { rows } = buildPivotTable([snapA, snapB]);
    const portRow = rows.find((r) => r.key === 'PORT');
    expect(portRow.dev).toBe('3000');
    expect(portRow.prod).toBe('8080');
  });

  test('missing values are null', () => {
    const { rows } = buildPivotTable([snapA, snapB]);
    const debugRow = rows.find((r) => r.key === 'DEBUG');
    expect(debugRow.dev).toBe('true');
    expect(debugRow.prod).toBeNull();
  });

  test('returns empty rows for empty snapshots', () => {
    const result = buildPivotTable([]);
    expect(result.rows).toEqual([]);
    expect(result.columns).toEqual([]);
  });
});

describe('formatPivotTable', () => {
  test('returns no-variables message when empty', () => {
    const out = formatPivotTable({ keys: [], columns: [], rows: [] });
    expect(out).toBe('No variables found.');
  });

  test('includes column headers', () => {
    const table = buildPivotTable([snapA, snapB]);
    const out = formatPivotTable(table);
    expect(out).toContain('dev');
    expect(out).toContain('prod');
  });

  test('includes key names in output', () => {
    const table = buildPivotTable([snapA, snapB]);
    const out = formatPivotTable(table);
    expect(out).toContain('NODE_ENV');
    expect(out).toContain('PORT');
  });

  test('uses dash for missing values', () => {
    const table = buildPivotTable([snapA, snapB]);
    const out = formatPivotTable(table);
    expect(out).toContain('—');
  });
});
