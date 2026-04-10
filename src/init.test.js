const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadConfig, saveConfig, initProject, isInitialized, formatInitSummary, DEFAULT_CONFIG } = require('./init');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-init-'));
}

describe('loadConfig', () => {
  it('returns defaults when no config file exists', () => {
    const dir = makeTmpDir();
    const config = loadConfig(dir);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('merges saved config over defaults', () => {
    const dir = makeTmpDir();
    initProject({ maxSnapshots: 10 }, dir);
    const config = loadConfig(dir);
    expect(config.maxSnapshots).toBe(10);
    expect(config.defaultEnvFile).toBe('.env');
  });
});

describe('saveConfig', () => {
  it('persists config to disk', () => {
    const dir = makeTmpDir();
    saveConfig({ ...DEFAULT_CONFIG, autoTag: true }, dir);
    const config = loadConfig(dir);
    expect(config.autoTag).toBe(true);
  });
});

describe('initProject', () => {
  it('creates .snapenv dir and config', () => {
    const dir = makeTmpDir();
    const config = initProject({}, dir);
    expect(fs.existsSync(path.join(dir, '.snapenv'))).toBe(true);
    expect(config.defaultEnvFile).toBe('.env');
  });

  it('merges options into config', () => {
    const dir = makeTmpDir();
    const config = initProject({ defaultEnvFile: '.env.local' }, dir);
    expect(config.defaultEnvFile).toBe('.env.local');
  });

  it('preserves existing config values when reinitializing', () => {
    const dir = makeTmpDir();
    initProject({ maxSnapshots: 20 }, dir);
    const config = initProject({}, dir);
    expect(config.maxSnapshots).toBe(20);
  });
});

describe('isInitialized', () => {
  it('returns false for fresh dir', () => {
    const dir = makeTmpDir();
    expect(isInitialized(dir)).toBe(false);
  });

  it('returns true after init', () => {
    const dir = makeTmpDir();
    initProject({}, dir);
    expect(isInitialized(dir)).toBe(true);
  });
});

describe('formatInitSummary', () => {
  it('mentions initialized when new', () => {
    const summary = formatInitSummary(DEFAULT_CONFIG, false);
    expect(summary).toContain('initialized successfully');
  });

  it('mentions updated when already existed', () => {
    const summary = formatInitSummary(DEFAULT_CONFIG, true);
    expect(summary).toContain('config updated');
  });

  it('includes config values', () => {
    const summary = formatInitSummary(DEFAULT_CONFIG, false);
    expect(summary).toContain('.env');
    expect(summary).toContain('50');
  });
});
