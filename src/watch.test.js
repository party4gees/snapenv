const fs = require('fs');
const os = require('os');
const path = require('path');
const { watchEnvFile, formatWatchStatus } = require('./watch');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-watch-'));
}

describe('watchEnvFile', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTmpDir();
    process.env.SNAPENV_DIR = path.join(tmpDir, '.snapenv');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env.SNAPENV_DIR;
  });

  test('throws if env file does not exist', () => {
    expect(() => watchEnvFile('/nonexistent/.env', 'test')).toThrow('Env file not found');
  });

  test('returns a watcher object for a valid env file', () => {
    const envPath = path.join(tmpDir, '.env');
    fs.writeFileSync(envPath, 'FOO=bar\n');
    const watcher = watchEnvFile(envPath, 'my-snap', { debounce: 50 });
    expect(watcher).toBeDefined();
    expect(typeof watcher.close).toBe('function');
    watcher.close();
  });

  test('auto-saves snapshot when file changes', (done) => {
    const envPath = path.join(tmpDir, '.env');
    fs.writeFileSync(envPath, 'FOO=bar\n');

    const watcher = watchEnvFile(envPath, 'watch-snap', { debounce: 50 });

    setTimeout(() => {
      fs.writeFileSync(envPath, 'FOO=bar\nBAZ=qux\n');
    }, 30);

    setTimeout(() => {
      watcher.close();
      const snapDir = path.join(tmpDir, '.snapenv', 'snapshots');
      const files = fs.existsSync(snapDir) ? fs.readdirSync(snapDir) : [];
      expect(files.some(f => f.includes('watch-snap'))).toBe(true);
      done();
    }, 300);
  });
});

describe('formatWatchStatus', () => {
  test('returns a formatted status string', () => {
    const result = formatWatchStatus('.env', 'my-snap');
    expect(result).toContain('Watching:');
    expect(result).toContain('my-snap');
    expect(result).toContain('Ctrl+C');
  });
});
