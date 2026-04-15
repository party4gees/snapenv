const path = require('path');
const fs = require('fs');
const os = require('os');
const { cloneSnapshot, buildCloneSummary, formatCloneResult } = require('./clone');
const { saveSnapshot, loadSnapshot } = require('./snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-clone-'));
}

describe('buildCloneSummary', () => {
  it('returns correct summary shape', () => {
    const summary = buildCloneSummary('dev', 'dev-backup', { FOO: 'bar', BAZ: '1' });
    expect(summary).toEqual({ source: 'dev', dest: 'dev-backup', varCount: 2 });
  });
});

describe('formatCloneResult', () => {
  it('formats summary as readable string', () => {
    const summary = { source: 'dev', dest: 'dev-copy', varCount: 5 };
    const out = formatCloneResult(summary);
    expect(out).toContain('dev');
    expect(out).toContain('dev-copy');
    expect(out).toContain('5');
  });
});

describe('cloneSnapshot', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('clones an existing snapshot to a new name', async () => {
    await saveSnapshot('original', { KEY: 'value', OTHER: '123' }, { snapenvDir: tmpDir });
    const summary = await cloneSnapshot('original', 'copy', { snapenvDir: tmpDir });
    expect(summary.varCount).toBe(2);
    const loaded = await loadSnapshot('copy', { snapenvDir: tmpDir });
    expect(loaded.vars).toEqual({ KEY: 'value', OTHER: '123' });
  });

  it('throws if source snapshot does not exist', async () => {
    await expect(cloneSnapshot('ghost', 'newname', { snapenvDir: tmpDir })).rejects.toThrow('not found');
  });

  it('throws if destination already exists without force', async () => {
    await saveSnapshot('a', { X: '1' }, { snapenvDir: tmpDir });
    await saveSnapshot('b', { Y: '2' }, { snapenvDir: tmpDir });
    await expect(cloneSnapshot('a', 'b', { snapenvDir: tmpDir })).rejects.toThrow('already exists');
  });

  it('overwrites destination with force flag', async () => {
    await saveSnapshot('a', { X: '1' }, { snapenvDir: tmpDir });
    await saveSnapshot('b', { Y: '2' }, { snapenvDir: tmpDir });
    const summary = await cloneSnapshot('a', 'b', { snapenvDir: tmpDir, force: true });
    expect(summary.dest).toBe('b');
    const loaded = await loadSnapshot('b', { snapenvDir: tmpDir });
    expect(loaded.vars).toEqual({ X: '1' });
  });
});
