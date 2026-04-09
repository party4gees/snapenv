const fs = require('fs');
const path = require('path');
const os = require('os');
const { deleteSnapshot, pruneByAge, pruneKeepLatest, formatPruneSummary } = require('./prune');

jest.mock('./snapshot', () => {
  const snapshots = ['snap-a', 'snap-b', 'snap-c'];
  return {
    listSnapshots: () => snapshots,
    getSnapshotPath: (name) => `/tmp/snapenv/${name}.json`,
    ensureSnapenvDir: jest.fn(),
  };
});

jest.mock('fs');

beforeEach(() => {
  jest.clearAllMocks();
  fs.existsSync.mockReturnValue(true);
  fs.unlinkSync.mockImplementation(() => {});
  fs.statSync.mockImplementation((p) => {
    const name = path.basename(p, '.json');
    const ages = { 'snap-a': 5000, 'snap-b': 3000, 'snap-c': 1000 };
    return { mtimeMs: Date.now() - (ages[name] || 2000) };
  });
});

test('deleteSnapshot removes existing snapshot', () => {
  const result = deleteSnapshot('snap-a');
  expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/snapenv/snap-a.json');
  expect(result.deleted).toEqual(['snap-a']);
});

test('deleteSnapshot throws if snapshot does not exist', () => {
  fs.existsSync.mockReturnValue(false);
  expect(() => deleteSnapshot('nope')).toThrow('does not exist');
});

test('pruneByAge removes snapshots older than threshold', () => {
  const result = pruneByAge(2500);
  expect(result.deleted).toContain('snap-a');
  expect(result.deleted).toContain('snap-b');
  expect(result.deleted).not.toContain('snap-c');
});

test('pruneByAge returns empty if nothing is old enough', () => {
  const result = pruneByAge(100);
  expect(result.deleted).toHaveLength(0);
});

test('pruneKeepLatest keeps the N most recent', () => {
  const result = pruneKeepLatest(1);
  expect(result.deleted).toHaveLength(2);
  expect(result.deleted).not.toContain('snap-c');
});

test('pruneKeepLatest does nothing if count is >= total', () => {
  const result = pruneKeepLatest(10);
  expect(result.deleted).toHaveLength(0);
});

test('formatPruneSummary with deletions', () => {
  const out = formatPruneSummary({ deleted: ['snap-a', 'snap-b'] });
  expect(out).toMatch('2 snapshot(s)');
  expect(out).toMatch('snap-a');
});

test('formatPruneSummary with no deletions', () => {
  const out = formatPruneSummary({ deleted: [] });
  expect(out).toMatch('No snapshots');
});
