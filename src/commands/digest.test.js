const path = require('path');
const os = require('os');
const fs = require('fs');
const { runDigest, printDigestUsage } = require('./digest');
const { saveSnapshot, ensureSnapenvDir } = require('../snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-cmd-digest-'));
}

jest.mock('../snapshot', () => {
  const actual = jest.requireActual('../snapshot');
  return { ...actual, ensureSnapenvDir: jest.fn() };
});

const { ensureSnapenvDir } = require('../snapshot');

describe('runDigest', () => {
  let dir;

  beforeEach(() => {
    dir = makeTmpDir();
    ensureSnapenvDir.mockReturnValue(dir);
    process.exitCode = 0;
  });

  test('prints usage when no args', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    runDigest([]);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('prints usage with --help', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    runDigest(['dev'], { help: true });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('prints digest for single snapshot', () => {
    saveSnapshot(dir, 'dev', { KEY: 'val' });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    runDigest(['dev']);
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('dev');
    expect(output).toMatch(/SHA-256/);
    spy.mockRestore();
  });

  test('compares two matching snapshots', () => {
    saveSnapshot(dir, 'a', { K: 'v' });
    saveSnapshot(dir, 'b', { K: 'v' });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    runDigest(['a', 'b']);
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('yes');
    expect(process.exitCode).toBe(0);
    spy.mockRestore();
  });

  test('sets exitCode 1 when snapshots differ', () => {
    saveSnapshot(dir, 'a', { K: 'v1' });
    saveSnapshot(dir, 'b', { K: 'v2' });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    runDigest(['a', 'b']);
    expect(process.exitCode).toBe(1);
    spy.mockRestore();
  });

  test('sets exitCode 1 for missing snapshot', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    runDigest(['nonexistent']);
    expect(process.exitCode).toBe(1);
    spy.mockRestore();
  });
});
