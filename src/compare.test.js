const { compareSnapshots, formatCompareResult } = require('./compare');

describe('compareSnapshots', () => {
  const base = { FOO: 'foo', BAR: 'bar', SHARED: 'same' };
  const other = { FOO: 'changed', BAZ: 'baz', SHARED: 'same' };

  let result;
  beforeEach(() => {
    result = compareSnapshots(base, other);
  });

  test('detects added keys', () => {
    expect(result.added).toEqual({ BAZ: 'baz' });
  });

  test('detects removed keys', () => {
    expect(result.removed).toEqual({ BAR: 'bar' });
  });

  test('detects changed keys', () => {
    expect(result.changed).toEqual({ FOO: { from: 'foo', to: 'changed' } });
  });

  test('detects unchanged keys', () => {
    expect(result.unchanged).toEqual({ SHARED: 'same' });
  });

  test('returns empty diff for identical snapshots', () => {
    const r = compareSnapshots(base, base);
    expect(Object.keys(r.added)).toHaveLength(0);
    expect(Object.keys(r.removed)).toHaveLength(0);
    expect(Object.keys(r.changed)).toHaveLength(0);
    expect(Object.keys(r.unchanged)).toHaveLength(3);
  });

  test('handles empty snapshots', () => {
    const r = compareSnapshots({}, {});
    expect(r.added).toEqual({});
    expect(r.removed).toEqual({});
    expect(r.changed).toEqual({});
  });
});

describe('formatCompareResult', () => {
  test('shows no differences message when identical', () => {
    const r = compareSnapshots({ A: '1' }, { A: '1' });
    const out = formatCompareResult('snap1', 'snap2', r);
    expect(out).toContain('No differences found');
    expect(out).toContain('1 key(s) identical');
  });

  test('includes added, removed, changed lines', () => {
    const r = compareSnapshots({ OLD: 'x', SAME: 'y' }, { NEW: 'z', SAME: 'y' });
    const out = formatCompareResult('a', 'b', r);
    expect(out).toContain('+ NEW=z');
    expect(out).toContain('- OLD=x');
    expect(out).toContain('Comparing "a" → "b"');
  });

  test('includes summary line', () => {
    const r = compareSnapshots({ A: '1' }, { A: '2', B: '3' });
    const out = formatCompareResult('x', 'y', r);
    expect(out).toContain('+1 added');
    expect(out).toContain('~1 changed');
  });
});
