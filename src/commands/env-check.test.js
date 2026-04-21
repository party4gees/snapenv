const { runEnvCheck, printEnvCheckUsage } = require('./env-check');
const { loadSnapshot } = require('../snapshot');
const { parseEnvFile } = require('../env');
const { envCheck, formatEnvCheckResult } = require('../env-check');

jest.mock('../snapshot');
jest.mock('../env');
jest.mock('../env-check');

const mockSnapshot = { NODE_ENV: 'production', DB_HOST: 'localhost' };
const mockEnv = { NODE_ENV: 'production', DB_HOST: 'localhost' };

beforeEach(() => {
  jest.clearAllMocks();
  loadSnapshot.mockReturnValue(mockSnapshot);
  parseEnvFile.mockReturnValue(mockEnv);
  envCheck.mockReturnValue({ ok: true, missing: [], mismatched: [] });
  formatEnvCheckResult.mockReturnValue('Env check against snapshot "prod": ✓ All keys present and matching.');
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('printEnvCheckUsage', () => {
  test('prints usage info', () => {
    printEnvCheckUsage();
    expect(console.log).toHaveBeenCalled();
    const output = console.log.mock.calls[0][0];
    expect(output).toContain('env-check');
    expect(output).toContain('snapshot-name');
  });
});

describe('runEnvCheck', () => {
  test('prints usage when no args', () => {
    runEnvCheck([]);
    expect(console.log).toHaveBeenCalled();
    expect(loadSnapshot).not.toHaveBeenCalled();
  });

  test('prints usage with --help', () => {
    runEnvCheck(['--help']);
    expect(loadSnapshot).not.toHaveBeenCalled();
  });

  test('loads snapshot and runs check', () => {
    runEnvCheck(['prod']);
    expect(loadSnapshot).toHaveBeenCalledWith('prod');
    expect(envCheck).toHaveBeenCalled();
    expect(formatEnvCheckResult).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  test('handles missing snapshot gracefully', () => {
    loadSnapshot.mockImplementation(() => { throw new Error('not found'); });
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    runEnvCheck(['nonexistent']);
    expect(console.error).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  test('exits with 1 in strict mode when check fails', () => {
    envCheck.mockReturnValue({ ok: false, missing: ['DB_HOST'], mismatched: [] });
    formatEnvCheckResult.mockReturnValue('Env check: issues found.');
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    runEnvCheck(['prod', '--strict']);
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  test('does not exit in non-strict mode when check fails', () => {
    envCheck.mockReturnValue({ ok: false, missing: ['DB_HOST'], mismatched: [] });
    formatEnvCheckResult.mockReturnValue('Env check: issues found.');
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    runEnvCheck(['prod']);
    expect(exitSpy).not.toHaveBeenCalled();
    exitSpy.mockRestore();
  });
});
