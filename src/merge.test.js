const { mergeEnvVars, applyMissingKeys, formatMergeSummary } = require('./merge');

describe('mergeEnvVars', () => {
  const base = { FOO: 'foo', BAR: 'bar' };
  const incoming = { FOO: 'new-foo', BAZ: 'baz' };

  test('strategy theirs overwrites conflicting keys', () => {
    const { merged, conflicts } = mergeEnvVars(base, incoming, 'theirs');
    expect(merged.FOO).toBe('new-foo');
    expect(merged.BAR).toBe('bar');
    expect(merged.BAZ).toBe('baz');
    expect(conflicts).toEqual(['FOO']);
  });

  test('strategy ours keeps base value on conflict', () => {
    const { merged, conflicts } = mergeEnvVars(base, incoming, 'ours');
    expect(merged.FOO).toBe('foo');
    expect(merged.BAZ).toBe('baz');
    expect(conflicts).toEqual(['FOO']);
  });

  test('no conflicts when keys are identical', () => {
    const { merged, conflicts } = mergeEnvVars(base, { FOO: 'foo' }, 'theirs');
    expect(conflicts).toHaveLength(0);
    expect(merged.FOO).toBe('foo');
  });

  test('no conflicts when incoming has only new keys', () => {
    const { merged, conflicts } = mergeEnvVars(base, { NEW: 'val' }, 'theirs');
    expect(conflicts).toHaveLength(0);
    expect(merged.NEW).toBe('val');
  });
});

describe('applyMissingKeys', () => {
  test('adds keys not present in base', () => {
    const result = applyMissingKeys({ A: '1' }, { A: '99', B: '2' });
    expect(result.A).toBe('1');
    expect(result.B).toBe('2');
  });

  test('returns copy, does not mutate base', () => {
    const base = { A: '1' };
    applyMissingKeys(base, { B: '2' });
    expect(base).not.toHaveProperty('B');
  });
});

describe('formatMergeSummary', () => {
  test('no conflicts message', () => {
    expect(formatMergeSummary([], 'theirs')).toBe('Merge completed with no conflicts.');
  });

  test('lists conflicts with theirs strategy', () => {
    const summary = formatMergeSummary(['FOO', 'BAR'], 'theirs');
    expect(summary).toContain('2 conflict(s)');
    expect(summary).toContain('snapshot value used');
    expect(summary).toContain('~ FOO');
  });

  test('lists conflicts with ours strategy', () => {
    const summary = formatMergeSummary(['X'], 'ours');
    expect(summary).toContain('current value kept');
  });
});
