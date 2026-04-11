const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  archiveSnapshot,
  listArchived,
  restoreFromArchive,
  formatArchiveList,
  getArchiveDir,
} = require('./archive');
const { saveSnapshot } = require('./snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-archive-'));
}

describe('archiveSnapshot', () => {
  it('moves snapshot to archive dir', () => {
    const dir = makeTmpDir();
    saveSnapshot('mysnap', { FOO: 'bar' }, dir);
    const result = archiveSnapshot('mysnap', dir);
    expect(result.name).toBe('mysnap');
    expect(result.archiveName).toMatch(/^mysnap\.\d+\.json$/);
    expect(fs.existsSync(path.join(dir, '.snapenv', 'mysnap.json'))).toBe(false);
    expect(fs.existsSync(path.join(dir, '.snapenv', 'archive', result.archiveName))).toBe(true);
  });

  it('throws if snapshot does not exist', () => {
    const dir = makeTmpDir();
    expect(() => archiveSnapshot('ghost', dir)).toThrow('not found');
  });
});

describe('listArchived', () => {
  it('returns empty array when no archive dir', () => {
    const dir = makeTmpDir();
    expect(listArchived(dir)).toEqual([]);
  });

  it('lists archived snapshots sorted by date', () => {
    const dir = makeTmpDir();
    saveSnapshot('alpha', { A: '1' }, dir);
    saveSnapshot('beta', { B: '2' }, dir);
    archiveSnapshot('alpha', dir);
    archiveSnapshot('beta', dir);
    const list = listArchived(dir);
    expect(list.length).toBe(2);
    expect(list.every(e => e.archivedAt && e.archiveName)).toBe(true);
    expect(list.map(e => e.name)).toContain('alpha');
    expect(list.map(e => e.name)).toContain('beta');
  });
});

describe('restoreFromArchive', () => {
  it('restores archived snapshot back to active snapshots', () => {
    const dir = makeTmpDir();
    saveSnapshot('snap1', { KEY: 'val' }, dir);
    const { archiveName } = archiveSnapshot('snap1', dir);
    const result = restoreFromArchive(archiveName, dir);
    expect(result.name).toBe('snap1');
    expect(fs.existsSync(path.join(dir, '.snapenv', 'snap1.json'))).toBe(true);
    expect(fs.existsSync(path.join(dir, '.snapenv', 'archive', archiveName))).toBe(false);
  });

  it('throws if archive file does not exist', () => {
    const dir = makeTmpDir();
    expect(() => restoreFromArchive('nope.123.json', dir)).toThrow('not found');
  });

  it('throws if snapshot with same name already exists', () => {
    const dir = makeTmpDir();
    saveSnapshot('dup', { X: '1' }, dir);
    const { archiveName } = archiveSnapshot('dup', dir);
    saveSnapshot('dup', { X: '2' }, dir);
    expect(() => restoreFromArchive(archiveName, dir)).toThrow('already exists');
  });
});

describe('formatArchiveList', () => {
  it('returns message when empty', () => {
    expect(formatArchiveList([])).toMatch(/No archived/);
  });

  it('formats list with count and entries', () => {
    const entries = [
      { name: 'snap1', archiveName: 'snap1.111.json', archivedAt: '2024-01-01T00:00:00.000Z' },
    ];
    const out = formatArchiveList(entries);
    expect(out).toMatch(/Archived snapshots \(1\)/);
    expect(out).toMatch('snap1');
  });
});
