const { diffEnvVars, formatDiff } = require('./diff');

describe('diffEnvVars', () => {
  test('detects added keys', () => {
    const base = { FOO: 'bar' };
    const current = { FOO: 'bar', NEW_KEY: 'hello' };
    const result = diffEnvVars(base, current);
    expect(result.added).toEqual({ NEW_KEY: 'hello' });
    expect(result.removed).toEqual({});
    expect(result.changed).toEqual({});
  });

  test('detects removed keys', () => {
    const base = { FOO: 'bar', OLD_KEY: 'bye' };
    const current = { FOO: 'bar' };
    const result = diffEnvVars(base, current);
    expect(result.removed).toEqual({ OLD_KEY: 'bye' });
    expect(result.added).toEqual({});
    expect(result.changed).toEqual({});
  });

  test('detects changed values', () => {
    const base = { FOO: 'bar' };
    const current = { FOO: 'baz' };
    const result = diffEnvVars(base, current);
    expect(result.changed).toEqual({ FOO: { from: 'bar', to: 'baz' } });
    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
  });

  test('returns empty diff for identical objects', () => {
    const env = { FOO: 'bar', BAZ: '123' };
    const result = diffEnvVars(env, { ...env });
    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
    expect(result.changed).toEqual({});
  });

  test('handles empty base and current', () => {
    const result = diffEnvVars({}, {});
    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
    expect(result.changed).toEqual({});
  });
});

describe('formatDiff', () => {
  test('formats added, removed, and changed entries', () => {
    const diff = {
      added: { NEW: 'val' },
      removed: { OLD: 'gone' },
      changed: { FOO: { from: 'a', to: 'b' } }
    };
    const output = formatDiff(diff);
    expect(output).toContain('+ NEW=val');
    expect(output).toContain('- OLD=gone');
    expect(output).toContain('~ FOO: a → b');
  });

  test('returns no differences message when diff is empty', () => {
    const diff = { added: {}, removed: {}, changed: {} };
    expect(formatDiff(diff)).toBe('No differences found.');
  });
});
