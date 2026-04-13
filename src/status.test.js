const fs = require('fs');
const os = require('os');
const path = require('path');
const { getActiveSnapshot, setActiveSnapshot, clearActiveSnapshot, getStatus, formatStatus } = require('./status');
const { saveSnapshot } = require('./snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-status-'));
}

describe('getActiveSnapshot / setActiveSnapshot / clearActiveSnapshot', () => {
  it('returns null when no active file exists', () => {
    const dir = makeTmpDir();
    expect(getActiveSnapshot(dir)).toBeNull();
  });

  it('sets and retrieves active snapshot name', () => {
    const dir = makeTmpDir();
    setActiveSnapshot(dir, 'my-snap');
    expect(getActiveSnapshot(dir)).toBe('my-snap');
  });

  it('clears active snapshot', () => {
    const dir = makeTmpDir();
    setActiveSnapshot(dir, 'my-snap');
    clearActiveSnapshot(dir);
    expect(getActiveSnapshot(dir)).toBeNull();
  });

  it('clearActiveSnapshot is safe when no active file', () => {
    const dir = makeTmpDir();
    expect(() => clearActiveSnapshot(dir)).not.toThrow();
  });
});

describe('getStatus', () => {
  it('returns status with no active snapshot and no env file', () => {
    const dir = makeTmpDir();
    const envPath = path.join(dir, '.env');
    const status = getStatus(dir, envPath);
    expect(status.active).toBeNull();
    expect(status.envExists).toBe(false);
    expect(status.snapshotCount).toBe(0);
    expect(status.drift).toBeNull();
    expect(status.hasDrift).toBe(false);
  });

  it('detects drift when active snapshot differs from env', () => {
    const dir = makeTmpDir();
    const envPath = path.join(dir, '.env');
    saveSnapshot(dir, 'base', { FOO: 'bar', BAZ: 'qux' });
    setActiveSnapshot(dir, 'base');
    fs.writeFileSync(envPath, 'FOO=changed\nNEW=val\n', 'utf8');
    const status = getStatus(dir, envPath);
    expect(status.active).toBe('base');
    expect(status.hasDrift).toBe(true);
    expect(status.drift.changed.length).toBeGreaterThan(0);
  });

  it('reports no drift when env matches active snapshot', () => {
    const dir = makeTmpDir();
    const envPath = path.join(dir, '.env');
    saveSnapshot(dir, 'exact', { FOO: 'bar' });
    setActiveSnapshot(dir, 'exact');
    fs.writeFileSync(envPath, 'FOO=bar\n', 'utf8');
    const status = getStatus(dir, envPath);
    expect(status.hasDrift).toBe(false);
  });
});

describe('formatStatus', () => {
  it('formats status output as a string', () => {
    const status = {
      active: 'prod',
      snapshotCount: 3,
      envExists: true,
      envVarCount: 5,
      drift: { added: [], removed: ['X'], changed: [] },
      hasDrift: true,
    };
    const out = formatStatus(status);
    expect(out).toContain('prod');
    expect(out).toContain('3');
    expect(out).toContain('Drift detected');
  });

  it('shows none when no active snapshot', () => {
    const status = { active: null, snapshotCount: 0, envExists: false, envVarCount: 0, drift: null, hasDrift: false };
    const out = formatStatus(status);
    expect(out).toContain('(none)');
  });
});
