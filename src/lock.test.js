const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  lockSnapshot,
  unlockSnapshot,
  isLocked,
  getLockInfo,
  formatLockStatus,
  loadLocks,
} = require('./lock');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-lock-test-'));
}

function makeSnapshot(dir, name) {
  const snapshotPath = path.join(dir, `${name}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify({ FOO: 'bar' }));
}

describe('lock', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('lockSnapshot locks an existing snapshot', () => {
    makeSnapshot(tmpDir, 'prod');
    const info = lockSnapshot(tmpDir, 'prod', 'do not touch');
    expect(info.reason).toBe('do not touch');
    expect(info.lockedAt).toBeDefined();
  });

  test('lockSnapshot throws if snapshot does not exist', () => {
    expect(() => lockSnapshot(tmpDir, 'ghost')).toThrow('does not exist');
  });

  test('lockSnapshot throws if already locked', () => {
    makeSnapshot(tmpDir, 'prod');
    lockSnapshot(tmpDir, 'prod');
    expect(() => lockSnapshot(tmpDir, 'prod')).toThrow('already locked');
  });

  test('lockSnapshot stores a valid ISO timestamp', () => {
    makeSnapshot(tmpDir, 'prod');
    const info = lockSnapshot(tmpDir, 'prod', 'checking timestamp');
    expect(() => new Date(info.lockedAt)).not.toThrow();
    expect(new Date(info.lockedAt).toISOString()).toBe(info.lockedAt);
  });

  test('isLocked returns true after locking', () => {
    makeSnapshot(tmpDir, 'staging');
    lockSnapshot(tmpDir, 'staging');
    expect(isLocked(tmpDir, 'staging')).toBe(true);
  });

  test('isLocked returns false for unlocked snapshot', () => {
    makeSnapshot(tmpDir, 'dev');
    expect(isLocked(tmpDir, 'dev')).toBe(false);
  });

  test('unlockSnapshot removes the lock', () => {
    makeSnapshot(tmpDir, 'prod');
    lockSnapshot(tmpDir, 'prod');
    unlockSnapshot(tmpDir, 'prod');
    expect(isLocked(tmpDir, 'prod')).toBe(false);
  });

  test('unlockSnapshot throws if not locked', () => {
    makeSnapshot(tmpDir, 'prod');
    expect(() => unlockSnapshot(tmpDir, 'prod')).toThrow('not locked');
  });

  test('getLockInfo returns null for unlocked snapshot', () => {
    expect(getLockInfo(tmpDir, 'nope')).toBeNull();
  });

  test('getLockInfo returns lock details after locking', () => {
    makeSnapshot(tmpDir, 'prod');
    lockSnapshot(tmpDir, 'prod', 'freeze');
    const info = getLockInfo(tmpDir, 'prod');
    expect(info).not.toBeNull();
    expect(info.reason).toBe('freeze');
    expect(info.lockedAt).toBeDefined();
  });

  test('formatLockStatus shows locked info', () => {
    makeSnapshot(tmpDir, 'prod');
    lockSnapshot(tmpDir, 'prod', 'release freeze');
    const info = getLockInfo(tmpDir, 'prod');
    const result = formatLockStatus('prod', info);
    expect(result).toContain('locked since');
    expect(result).toContain('release freeze');
  });

  test('formatLockStatus shows unlocked', () => {
    expect(formatLockStatus('dev', null)).toBe('dev: unlocked');
  });

  test('loadLocks returns all locked snapshots', () => {
    makeSnapshot(tmpDir, 'prod');
    makeSnapshot(tmpDir, 'staging');
    makeSnapshot(tmpDir, 'dev');
    lockSnapshot(tmpDir, 'prod', 'release freeze');
    lockSnapshot(tmpDir, 'staging', 'qa hold');
    const locks = loadLocks(tmpDir);
    expect(locks['prod']).toBeDefined();
    expect(locks['staging']).toBeDefined();
    expect(locks['dev']).toBeUndefined();
  });
});
