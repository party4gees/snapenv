const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getAliasesPath,
  loadAliases,
  addAlias,
  removeAlias,
  resolveAlias,
  getAliasesForSnapshot,
  formatAliasList,
} = require('./alias');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-alias-test-'));
}

function makeSnapshot(dir, name) {
  const snapenvDir = path.join(dir, '.snapenv');
  fs.mkdirSync(snapenvDir, { recursive: true });
  fs.writeFileSync(path.join(snapenvDir, `${name}.json`), JSON.stringify({ vars: {} }));
}

test('loadAliases returns empty object when no aliases file', () => {
  const dir = makeTmpDir();
  expect(loadAliases(dir)).toEqual({});
});

test('addAlias creates an alias for an existing snapshot', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'prod-2024');
  const aliases = addAlias('prod', 'prod-2024', dir);
  expect(aliases['prod']).toBe('prod-2024');
  expect(loadAliases(dir)['prod']).toBe('prod-2024');
});

test('addAlias throws if snapshot does not exist', () => {
  const dir = makeTmpDir();
  expect(() => addAlias('prod', 'nonexistent', dir)).toThrow('does not exist');
});

test('addAlias throws if alias already exists', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'snap1');
  makeSnapshot(dir, 'snap2');
  addAlias('myalias', 'snap1', dir);
  expect(() => addAlias('myalias', 'snap2', dir)).toThrow('already exists');
});

test('removeAlias removes an existing alias', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'staging');
  addAlias('stg', 'staging', dir);
  const aliases = removeAlias('stg', dir);
  expect(aliases['stg']).toBeUndefined();
});

test('removeAlias throws if alias does not exist', () => {
  const dir = makeTmpDir();
  expect(() => removeAlias('ghost', dir)).toThrow('does not exist');
});

test('resolveAlias returns snapshot name for known alias', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'production');
  addAlias('live', 'production', dir);
  expect(resolveAlias('live', dir)).toBe('production');
});

test('resolveAlias returns input unchanged if not an alias', () => {
  const dir = makeTmpDir();
  expect(resolveAlias('some-snapshot', dir)).toBe('some-snapshot');
});

test('getAliasesForSnapshot returns all aliases pointing to a snapshot', () => {
  const dir = makeTmpDir();
  makeSnapshot(dir, 'snap');
  addAlias('a1', 'snap', dir);
  addAlias('a2', 'snap', dir);
  const result = getAliasesForSnapshot('snap', dir);
  expect(result).toContain('a1');
  expect(result).toContain('a2');
});

test('formatAliasList returns message when no aliases', () => {
  expect(formatAliasList({})).toMatch(/No aliases/);
});

test('formatAliasList formats aliases correctly', () => {
  const result = formatAliasList({ prod: 'production-2024', dev: 'dev-local' });
  expect(result).toContain('prod -> production-2024');
  expect(result).toContain('dev -> dev-local');
});
