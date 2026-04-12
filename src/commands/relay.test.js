const fs = require('fs');
const os = require('os');
const path = require('path');
const { runRelay } = require('./relay');
const { ensureSnapenvDir, saveSnapshot } = require('../snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-cmd-relay-'));
}

describe('runRelay', () => {
  let tmpDir;
  let logs, errors;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    logs = [];
    errors = [];
    jest.spyOn(console, 'log').mockImplementation((...a) => logs.push(a.join(' ')));
    jest.spyOn(console, 'error').mockImplementation((...a) => errors.push(a.join(' ')));
    process.exitCode = 0;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('prints usage with no args', () => {
    runRelay([], { cwd: tmpDir });
    expect(logs.some(l => l.includes('snapenv relay'))).toBe(true);
  });

  test('set creates a relay', () => {
    runRelay(['set', 'staging', '/projects/other'], { cwd: tmpDir });
    expect(logs.some(l => l.includes('staging'))).toBe(true);
    expect(logs.some(l => l.includes('/projects/other'))).toBe(true);
  });

  test('set fails without enough args', () => {
    runRelay(['set', 'staging'], { cwd: tmpDir });
    expect(process.exitCode).toBe(1);
  });

  test('list shows no relays message initially', () => {
    runRelay(['list'], { cwd: tmpDir });
    expect(logs.some(l => l.includes('No relays'))).toBe(true);
  });

  test('list shows relay after set', () => {
    runRelay(['set', 'prod', '/projects/prod'], { cwd: tmpDir });
    logs.length = 0;
    runRelay(['list'], { cwd: tmpDir });
    expect(logs.some(l => l.includes('prod'))).toBe(true);
  });

  test('get shows relay info', () => {
    runRelay(['set', 'dev', '/projects/dev'], { cwd: tmpDir });
    logs.length = 0;
    runRelay(['get', 'dev'], { cwd: tmpDir });
    expect(logs.some(l => l.includes('/projects/dev'))).toBe(true);
  });

  test('get errors on missing relay', () => {
    runRelay(['get', 'ghost'], { cwd: tmpDir });
    expect(process.exitCode).toBe(1);
    expect(errors.some(e => e.includes('not found'))).toBe(true);
  });

  test('remove deletes relay', () => {
    runRelay(['set', 'tmp', '/p/tmp'], { cwd: tmpDir });
    logs.length = 0;
    runRelay(['remove', 'tmp'], { cwd: tmpDir });
    expect(logs.some(l => l.includes('Removed'))).toBe(true);
  });

  test('remove on missing relay logs not found', () => {
    runRelay(['remove', 'nope'], { cwd: tmpDir });
    expect(logs.some(l => l.includes('not found'))).toBe(true);
  });

  test('unknown subcommand sets exitCode', () => {
    runRelay(['bogus'], { cwd: tmpDir });
    expect(process.exitCode).toBe(1);
  });
});
