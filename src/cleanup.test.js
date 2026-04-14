const fs = require('fs');
const path = require('path');
const os = require('os');
const { cleanupSnapshots, formatCleanupResult, getUntaggedSnapshots } = require('./cleanup');
const { saveSnapshot, ensureSnapenvDir } = require('./snapshot');
const { pinSnapshot } = require('./pin');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-cleanup-'));
}

describe('cleanupSnapshots', () => {
  test('removes all unpinned snapshots', () => {
    const dir = makeTmpDir();
    ensureSnapenvDir(dir);
    saveSnapshot(dir, 'snap1', { FOO: 'bar' });
    saveSnapshot(dir, 'snap2', { BAZ: 'qux' });
    const result = cleanupSnapshots(dir, { skipPinned: true });
    expect(result.removed).toContain('snap1');
    expect(result.removed).toContain('snap2');
    expect(result.skipped).toHaveLength(0);
  });

  test('skips pinned snapshots', () => {
    const dir = makeTmpDir();
    ensureSnapenvDir(dir);
    saveSnapshot(dir, 'pinned', { A: '1' });
    saveSnapshot(dir, 'free', { B: '2' });
    pinSnapshot(dir, 'pinned');
    const result = cleanupSnapshots(dir, { skipPinned: true });
    expect(result.removed).toContain('free');
    expect(result.skipped.map(s => s.name)).toContain('pinned');
  });

  test('dry run does not delete files', () => {
    const dir = makeTmpDir();
    ensureSnapenvDir(dir);
    saveSnapshot(dir, 'snap1', { X: 'y' });
    const result = cleanupSnapshots(dir, { dryRun: true });
    expect(result.dryRun).toBe(true);
    expect(result.removed).toContain('snap1');
    const snapPath = path.join(dir, '.snapenv', 'snap1.json');
    expect(fs.existsSync(snapPath)).toBe(true);
  });

  test('returns empty removed when no snapshots exist', () => {
    const dir = makeTmpDir();
    ensureSnapenvDir(dir);
    const result = cleanupSnapshots(dir);
    expect(result.removed).toHaveLength(0);
  });
});

describe('formatCleanupResult', () => {
  test('formats dry run result', () => {
    const result = { removed: ['snap1'], skipped: [], dryRun: true };
    const output = formatCleanupResult(result);
    expect(output).toContain('dry run');
    expect(output).toContain('snap1');
  });

  test('formats skipped entries', () => {
    const result = { removed: [], skipped: [{ name: 'locked', reason: 'pinned' }], dryRun: false };
    const output = formatCleanupResult(result);
    expect(output).toContain('locked');
    expect(output).toContain('pinned');
  });

  test('shows no snapshots removed message', () => {
    const result = { removed: [], skipped: [], dryRun: false };
    const output = formatCleanupResult(result);
    expect(output).toContain('No snapshots removed');
  });
});
