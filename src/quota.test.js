const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadQuota, saveQuota, setQuota, checkQuota, formatQuotaStatus, getSnapshotsDirSize } = require('./quota');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-quota-'));
}

function writeSnapshot(dir, name, content) {
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(content));
}

test('loadQuota returns defaults when no file exists', () => {
  const dir = makeTmpDir();
  const quota = loadQuota(dir);
  expect(quota.maxSnapshots).toBe(50);
  expect(quota.maxSizeBytes).toBe(10 * 1024 * 1024);
});

test('saveQuota and loadQuota round-trip', () => {
  const dir = makeTmpDir();
  saveQuota({ maxSnapshots: 10, maxSizeBytes: 500 }, dir);
  const quota = loadQuota(dir);
  expect(quota.maxSnapshots).toBe(10);
  expect(quota.maxSizeBytes).toBe(500);
});

test('setQuota updates only specified fields', () => {
  const dir = makeTmpDir();
  saveQuota({ maxSnapshots: 20, maxSizeBytes: 1000 }, dir);
  const updated = setQuota({ maxSnapshots: 5 }, dir);
  expect(updated.maxSnapshots).toBe(5);
  expect(updated.maxSizeBytes).toBe(1000);
});

test('getSnapshotsDirSize sums file sizes', () => {
  const dir = makeTmpDir();
  fs.writeFileSync(path.join(dir, 'a.json'), 'hello');
  fs.writeFileSync(path.join(dir, 'b.json'), 'world!');
  const size = getSnapshotsDirSize(dir);
  expect(size).toBe(11);
});

test('checkQuota returns ok when under limits', () => {
  const dir = makeTmpDir();
  saveQuota({ maxSnapshots: 10, maxSizeBytes: 100000 }, dir);
  writeSnapshot(dir, 'snap1', { FOO: 'bar' });
  const result = checkQuota(dir);
  expect(result.ok).toBe(true);
  expect(result.violations).toHaveLength(0);
  expect(result.count).toBe(1);
});

test('checkQuota reports violation when count at limit', () => {
  const dir = makeTmpDir();
  saveQuota({ maxSnapshots: 2, maxSizeBytes: 100000 }, dir);
  writeSnapshot(dir, 'snap1', { A: '1' });
  writeSnapshot(dir, 'snap2', { B: '2' });
  const result = checkQuota(dir);
  expect(result.ok).toBe(false);
  expect(result.violations.some(v => v.includes('count'))).toBe(true);
});

test('checkQuota reports violation when size at limit', () => {
  const dir = makeTmpDir();
  saveQuota({ maxSnapshots: 50, maxSizeBytes: 5 }, dir);
  writeSnapshot(dir, 'snap1', { KEY: 'value' });
  const result = checkQuota(dir);
  expect(result.ok).toBe(false);
  expect(result.violations.some(v => v.includes('size'))).toBe(true);
});

test('formatQuotaStatus includes count and size lines', () => {
  const dir = makeTmpDir();
  saveQuota({ maxSnapshots: 50, maxSizeBytes: 100000 }, dir);
  writeSnapshot(dir, 'snap1', { X: '1' });
  const status = checkQuota(dir);
  const output = formatQuotaStatus(status);
  expect(output).toMatch(/Snapshots:/);
  expect(output).toMatch(/Size:/);
  expect(output).toMatch(/OK/);
});
