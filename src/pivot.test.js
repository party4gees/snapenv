const { buildPivotTable, collectKeys, formatPivotTable } = require('./pivot');

const snapA = { name: 'alpha', vars: { NODE_ENV: 'development', PORT: '3000', DEBUG: 'true' } };
const snapB = { name: 'beta', vars: { NODE_ENV: 'production', PORT: '8080' } };
const snapC = { name: 'gamma', vars: { NODE_ENV: 'test', TIMEOUT: '5000' } };

describe('collectKeys', () => {
  it('returns sorted unique keys from all snapshots', () => {
    const keys = collectKeys([snapA, snapB, snapC]);
    expect(keys).toEqual(['DEBUG', 'NODE_ENV', 'PORT', 'TIMEOUT']);
  });

  it('returns empty array for empty input', () => {
    expect(collectKeys([])).toEqual([]);
  });

  it('handles single snapshot', () => {
    expect(collectKeys([snapA])).toEqual(['DEBUG', 'NODE_ENV', 'PORT']);
  });
});

describe('buildPivotTable', () => {
  it('builds rows with all keys present', () => {
    const keys = ['NODE_ENV', 'PORT', 'DEBUG', 'TIMEOUT'];
    const rows = buildPivotTable([snapA, snapB, snapC], keys);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ name: 'alpha', NODE_ENV: 'development', PORT: '3000', DEBUG: 'true', TIMEOUT: '' });
    expect(rows[1]).toMatchObject({ name: 'beta', NODE_ENV: 'production', PORT: '8080', DEBUG: '', TIMEOUT: '' });
    expect(rows[2]).toMatchObject({ name: 'gamma', NODE_ENV: 'test', PORT: '', TIMEOUT: '5000' });
  });

  it('returns empty array for no snapshots', () => {
    expect(buildPivotTable([], ['NODE_ENV'])).toEqual([]);
  });
});

describe('formatPivotTable', () => {
  it('returns no-data message when empty', () => {
    expect(formatPivotTable([], [])).toBe('No data to display.');
    expect(formatPivotTable([{ name: 'x' }], [])).toBe('No data to display.');
  });

  it('renders header and rows', () => {
    const keys = ['NODE_ENV', 'PORT'];
    const rows = buildPivotTable([snapA, snapB], keys);
    const output = formatPivotTable(rows, keys);
    expect(output).toContain('SNAPSHOT');
    expect(output).toContain('NODE_ENV');
    expect(output).toContain('PORT');
    expect(output).toContain('alpha');
    expect(output).toContain('beta');
    expect(output).toContain('development');
    expect(output).toContain('production');
  });

  it('pads columns consistently', () => {
    const keys = collectKeys([snapA, snapB]);
    const rows = buildPivotTable([snapA, snapB], keys);
    const lines = formatPivotTable(rows, keys).split('\n');
    // header, divider, 2 data rows
    expect(lines.length).toBe(4);
  });
});
