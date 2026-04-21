const path = require('path');
const os = require('os');
const fs = require('fs');
const { computeDigest, digestSnapshot, compareDigests, formatDigestResult } = require('./digest');
const { saveSnapshot } = require('./snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-digest-'));
}

describe('computeDigest', () => {
  test('returns consistent hex string for same input', () => {
    const d1 = computeDigest({ FOO: 'bar', BAZ: 'qux' });
    const d2 = computeDigest({ BAZ: 'qux', FOO: 'bar' });
    expect(d1).toBe(d2);
    expect(d1).toMatch(/^[a-f0-9]{64}$/);
  });

  test('differs when values change', () => {
    const d1 = computeDigest({ FOO: 'bar' });
    const d2 = computeDigest({ FOO: 'baz' });
    expect(d1).not.toBe(d2);
  });

  test('empty env produces stable digest', () => {
    const d = computeDigest({});
    expect(d).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('digestSnapshot', () => {
  test('returns name, digest, and keyCount', () => {
    const dir = makeTmpDir();
    saveSnapshot(dir, 'dev', { API_KEY: 'abc', PORT: '3000' });
    const result = digestSnapshot(dir, 'dev');
    expect(result.name).toBe('dev');
    expect(result.keyCount).toBe(2);
    expect(result.digest).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('compareDigests', () => {
  test('match true when snapshots are identical', () => {
    const dir = makeTmpDir();
    saveSnapshot(dir, 'a', { X: '1' });
    saveSnapshot(dir, 'b', { X: '1' });
    const result = compareDigests(dir, 'a', 'b');
    expect(result.match).toBe(true);
    expect(result.digestA).toBe(result.digestB);
  });

  test('match false when snapshots differ', () => {
    const dir = makeTmpDir();
    saveSnapshot(dir, 'a', { X: '1' });
    saveSnapshot(dir, 'b', { X: '2' });
    const result = compareDigests(dir, 'a', 'b');
    expect(result.match).toBe(false);
  });
});

describe('formatDigestResult', () => {
  test('formats output lines', () => {
    const out = formatDigestResult({ name: 'dev', digest: 'abc123', keyCount: 5 });
    expect(out).toContain('dev');
    expect(out).toContain('abc123');
    expect(out).toContain('5');
  });
});
