const { findRollbackTarget, rollbackSnapshot, formatRollbackResult } = require('./rollback');
const { saveHistory } = require('./history');
const { saveSnapshot } = require('./snapshot');
const os = require('os');
const path = require('path');
const fs = require('fs');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-rollback-'));
}

describe('findRollbackTarget', () => {
  it('returns null when no history exists', () => {
    const dir = makeTmpDir();
    const result = findRollbackTarget('mysnap', dir);
    expect(result).toBeNull();
  });

  it('returns previous snapshot from history', () => {
    const dir = makeTmpDir();
    const history = [
      { action: 'restore', snapshot: 'mysnap', previous: 'oldsnap', timestamp: new Date().toISOString() }
    ];
    saveHistory(dir, history);
    const result = findRollbackTarget('mysnap', dir);
    expect(result).toBe('oldsnap');
  });

  it('returns most recent previous when multiple entries', () => {
    const dir = makeTmpDir();
    const history = [
      { action: 'restore', snapshot: 'mysnap', previous: 'snap1', timestamp: '2024-01-01T00:00:00.000Z' },
      { action: 'restore', snapshot: 'mysnap', previous: 'snap2', timestamp: '2024-06-01T00:00:00.000Z' }
    ];
    saveHistory(dir, history);
    const result = findRollbackTarget('mysnap', dir);
    expect(result).toBe('snap2');
  });
});

describe('rollbackSnapshot', () => {
  it('returns failure when no rollback target found', () => {
    const dir = makeTmpDir();
    const envFile = path.join(dir, '.env');
    fs.writeFileSync(envFile, 'FOO=bar\n');
    const result = rollbackSnapshot('mysnap', envFile, dir);
    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/No rollback target/);
  });

  it('returns failure when target snapshot file missing', () => {
    const dir = makeTmpDir();
    const envFile = path.join(dir, '.env');
    fs.writeFileSync(envFile, 'FOO=bar\n');
    const history = [
      { action: 'restore', snapshot: 'mysnap', previous: 'ghost', timestamp: new Date().toISOString() }
    ];
    saveHistory(dir, history);
    const result = rollbackSnapshot('mysnap', envFile, dir);
    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/not found/);
  });
});

describe('formatRollbackResult', () => {
  it('formats success message', () => {
    const msg = formatRollbackResult({ success: true, rolledBackTo: 'oldsnap' });
    expect(msg).toContain('oldsnap');
    expect(msg).toContain('Rolled back');
  });

  it('formats failure message', () => {
    const msg = formatRollbackResult({ success: false, reason: 'No rollback target found in history.' });
    expect(msg).toContain('failed');
    expect(msg).toContain('No rollback target');
  });
});
