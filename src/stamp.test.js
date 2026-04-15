const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  stampSnapshot,
  removeStamp,
  getStampsForSnapshot,
  findSnapshotsByStamp,
  formatStampList,
} = require('./stamp');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-stamp-'));
}

function makeSnapshot(name, baseDir) {
  const dir = path.join(baseDir, '.snapenv');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify({ FOO: 'bar' }));
}

test('stampSnapshot adds a label entry', () => {
  const tmp = makeTmpDir();
  makeSnapshot('dev', tmp);
  const entry = stampSnapshot('dev', 'release-1.0', tmp);
  expect(entry.label).toBe('release-1.0');
  expect(entry.stampedAt).toBeDefined();
});

test('stampSnapshot throws if snapshot missing', () => {
  const tmp = makeTmpDir();
  expect(() => stampSnapshot('ghost', 'v1', tmp)).toThrow('not found');
});

test('getStampsForSnapshot returns all stamps', () => {
  const tmp = makeTmpDir();
  makeSnapshot('prod', tmp);
  stampSnapshot('prod', 'alpha', tmp);
  stampSnapshot('prod', 'beta', tmp);
  const stamps = getStampsForSnapshot('prod', tmp);
  expect(stamps).toHaveLength(2);
  expect(stamps.map(s => s.label)).toEqual(['alpha', 'beta']);
});

test('removeStamp removes matching label', () => {
  const tmp = makeTmpDir();
  makeSnapshot('staging', tmp);
  stampSnapshot('staging', 'v2', tmp);
  const removed = removeStamp('staging', 'v2', tmp);
  expect(removed).toBe(true);
  expect(getStampsForSnapshot('staging', tmp)).toHaveLength(0);
});

test('removeStamp returns false if label not found', () => {
  const tmp = makeTmpDir();
  makeSnapshot('staging', tmp);
  const removed = removeStamp('staging', 'nonexistent', tmp);
  expect(removed).toBe(false);
});

test('findSnapshotsByStamp returns matching snapshot names', () => {
  const tmp = makeTmpDir();
  makeSnapshot('a', tmp);
  makeSnapshot('b', tmp);
  stampSnapshot('a', 'lts', tmp);
  stampSnapshot('b', 'lts', tmp);
  const found = findSnapshotsByStamp('lts', tmp);
  expect(found.sort()).toEqual(['a', 'b']);
});

test('formatStampList formats stamps correctly', () => {
  const stamps = [{ label: 'v1', stampedAt: '2024-01-01T00:00:00.000Z' }];
  const result = formatStampList('mysnap', stamps);
  expect(result).toContain('mysnap');
  expect(result).toContain('v1');
});

test('formatStampList handles empty stamps', () => {
  const result = formatStampList('empty', []);
  expect(result).toContain('No stamps');
});
