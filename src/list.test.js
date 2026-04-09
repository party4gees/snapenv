const { listSnapshotsWithMeta, formatSnapshotList, getSnapshotMeta } = require('./list');
const { saveSnapshot } = require('./snapshot');
const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-list-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('getSnapshotMeta', () => {
  it('returns keyCount and createdAt for a valid snapshot file', () => {
    saveSnapshot(tmpDir, 'meta-test', { FOO: 'bar', BAZ: 'qux' });
    const snapshotPath = path.join(tmpDir, '.snapenv', 'meta-test.env');
    const meta = getSnapshotMeta(snapshotPath);
    expect(meta.keyCount).toBe(2);
    expect(meta.createdAt).toBeInstanceOf(Date);
  });

  it('returns zeroed meta for a missing file', () => {
    const meta = getSnapshotMeta('/nonexistent/path/snap.env');
    expect(meta.keyCount).toBe(0);
    expect(meta.createdAt).toBeNull();
  });
});

describe('listSnapshotsWithMeta', () => {
  it('returns empty array when no snapshots exist', () => {
    const result = listSnapshotsWithMeta(tmpDir);
    expect(result).toEqual([]);
  });

  it('returns snapshot entries with name and meta', () => {
    saveSnapshot(tmpDir, 'snap-a', { A: '1' });
    saveSnapshot(tmpDir, 'snap-b', { B: '2', C: '3' });
    const result = listSnapshotsWithMeta(tmpDir);
    expect(result).toHaveLength(2);
    const names = result.map(r => r.name);
    expect(names).toContain('snap-a');
    expect(names).toContain('snap-b');
    const snapB = result.find(r => r.name === 'snap-b');
    expect(snapB.keyCount).toBe(2);
  });
});

describe('formatSnapshotList', () => {
  it('returns a no-snapshots message for empty list', () => {
    expect(formatSnapshotList([])).toBe('No snapshots found.');
  });

  it('formats snapshot list with names and key counts', () => {
    const snapshots = [
      { name: 'dev', keyCount: 5, createdAt: new Date('2024-01-15T10:00:00Z') },
    ];
    const output = formatSnapshotList(snapshots);
    expect(output).toContain('dev');
    expect(output).toContain('5 keys');
    expect(output).toContain('Snapshots:');
  });

  it('handles null createdAt gracefully', () => {
    const snapshots = [{ name: 'orphan', keyCount: 0, createdAt: null }];
    const output = formatSnapshotList(snapshots);
    expect(output).toContain('unknown date');
  });
});
