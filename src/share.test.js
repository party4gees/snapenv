const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  createShareBundle,
  resolveShareBundle,
  revokeShareBundle,
  listShares,
  formatShareSummary,
  generateShareToken
} = require('./share');
const { saveSnapshot } = require('./snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-share-test-'));
}

test('generateShareToken returns 24-char hex string', () => {
  const token = generateShareToken();
  expect(typeof token).toBe('string');
  expect(token.length).toBe(24);
});

test('createShareBundle creates bundle file and index entry', () => {
  const dir = makeTmpDir();
  saveSnapshot(dir, 'mysnap', { FOO: 'bar', BAZ: '123' });
  const { token, bundlePath, bundle } = createShareBundle(dir, 'mysnap');
  expect(fs.existsSync(bundlePath)).toBe(true);
  expect(bundle.snapshotName).toBe('mysnap');
  expect(bundle.vars).toEqual({ FOO: 'bar', BAZ: '123' });
  expect(bundle.expiresAt).toBeNull();
  const index = listShares(dir);
  expect(index[token]).toBeDefined();
  expect(index[token].snapshotName).toBe('mysnap');
});

test('createShareBundle respects ttlHours option', () => {
  const dir = makeTmpDir();
  saveSnapshot(dir, 'snap2', { X: '1' });
  const { bundle } = createShareBundle(dir, 'snap2', { ttlHours: 2 });
  expect(bundle.expiresAt).not.toBeNull();
  const exp = new Date(bundle.expiresAt);
  expect(exp.getTime()).toBeGreaterThan(Date.now());
});

test('resolveShareBundle returns bundle when valid', () => {
  const dir = makeTmpDir();
  saveSnapshot(dir, 'snap3', { A: 'b' });
  const { token } = createShareBundle(dir, 'snap3');
  const result = resolveShareBundle(dir, token);
  expect(result).not.toBeNull();
  expect(result.expired).toBe(false);
  expect(result.bundle.snapshotName).toBe('snap3');
});

test('resolveShareBundle returns null for unknown token', () => {
  const dir = makeTmpDir();
  expect(resolveShareBundle(dir, 'nonexistenttoken12345678')).toBeNull();
});

test('resolveShareBundle detects expired bundle', () => {
  const dir = makeTmpDir();
  saveSnapshot(dir, 'snap4', { Z: '9' });
  const { token, bundlePath } = createShareBundle(dir, 'snap4');
  const raw = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  raw.expiresAt = new Date(Date.now() - 1000).toISOString();
  fs.writeFileSync(bundlePath, JSON.stringify(raw));
  const result = resolveShareBundle(dir, token);
  expect(result.expired).toBe(true);
});

test('revokeShareBundle removes file and index entry', () => {
  const dir = makeTmpDir();
  saveSnapshot(dir, 'snap5', { K: 'v' });
  const { token, bundlePath } = createShareBundle(dir, 'snap5');
  const removed = revokeShareBundle(dir, token);
  expect(removed).toBe(true);
  expect(fs.existsSync(bundlePath)).toBe(false);
  const index = listShares(dir);
  expect(index[token]).toBeUndefined();
});

test('formatShareSummary returns readable string', () => {
  const bundle = { snapshotName: 'mysnap', createdAt: '2024-01-01T00:00:00.000Z', expiresAt: null, note: 'hello' };
  const out = formatShareSummary('abc123', bundle);
  expect(out).toContain('mysnap');
  expect(out).toContain('abc123');
  expect(out).toContain('hello');
});
