const fs = require('fs');
const os = require('os');
const path = require('path');
const { createToken, revokeToken, resolveToken, listTokens, formatTokenList, loadTokens } = require('./token');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-token-'));
}

test('createToken stores token with metadata', () => {
  const dir = makeTmpDir();
  const t = createToken('ci-token', 'prod', 7, dir);
  expect(t.id).toHaveLength(48);
  expect(t.label).toBe('ci-token');
  expect(t.snapshotName).toBe('prod');
  expect(t.expiresAt).toBeGreaterThan(Date.now());
});

test('createToken with no expiry sets expiresAt to null', () => {
  const dir = makeTmpDir();
  const t = createToken('forever', 'dev', null, dir);
  expect(t.expiresAt).toBeNull();
});

test('revokeToken removes token', () => {
  const dir = makeTmpDir();
  const t = createToken('temp', 'staging', 1, dir);
  const result = revokeToken(t.id, dir);
  expect(result).toBe(true);
  const tokens = loadTokens(dir);
  expect(tokens[t.id]).toBeUndefined();
});

test('revokeToken returns false for unknown id', () => {
  const dir = makeTmpDir();
  expect(revokeToken('nonexistent', dir)).toBe(false);
});

test('resolveToken returns token when valid', () => {
  const dir = makeTmpDir();
  const t = createToken('valid', 'main', 10, dir);
  const resolved = resolveToken(t.id, dir);
  expect(resolved.snapshotName).toBe('main');
});

test('resolveToken returns null for expired token', () => {
  const dir = makeTmpDir();
  const t = createToken('expired', 'old', null, dir);
  const tokens = require('./token').loadTokens(dir);
  tokens[t.id].expiresAt = Date.now() - 1000;
  require('./token').saveTokens(tokens, dir);
  expect(resolveToken(t.id, dir)).toBeNull();
});

test('listTokens returns all tokens', () => {
  const dir = makeTmpDir();
  createToken('a', 'snap1', 1, dir);
  createToken('b', 'snap2', 2, dir);
  const list = listTokens(dir);
  expect(list).toHaveLength(2);
});

test('formatTokenList formats tokens correctly', () => {
  const dir = makeTmpDir();
  createToken('mytoken', 'prod', 5, dir);
  const list = listTokens(dir);
  const output = formatTokenList(list);
  expect(output).toContain('mytoken');
  expect(output).toContain('prod');
});

test('formatTokenList shows empty message', () => {
  expect(formatTokenList([])).toBe('No tokens found.');
});
