jest.mock('../snapshot');
jest.mock('../env');
jest.mock('../merge');

const { loadSnapshot } = require('../snapshot');
const { parseEnvFile, serializeEnvVars, writeEnvFile } = require('../env');
const { mergeEnvVars, formatMergeSummary } = require('../merge');
const { mergeCommand } = require('./merge');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('mergeCommand', () => {
  test('merges snapshot into env file with theirs strategy', async () => {
    loadSnapshot.mockResolvedValue({ FOO: 'snap' });
    parseEnvFile.mockResolvedValue({ FOO: 'current', BAR: 'bar' });
    mergeEnvVars.mockReturnValue({ merged: { FOO: 'snap', BAR: 'bar' }, conflicts: ['FOO'] });
    formatMergeSummary.mockReturnValue('1 conflict(s) resolved');
    serializeEnvVars.mockReturnValue('FOO=snap\nBAR=bar\n');
    writeEnvFile.mockResolvedValue();

    await mergeCommand('my-snapshot', { strategy: 'theirs', envFile: '/tmp/.env' });

    expect(loadSnapshot).toHaveBeenCalledWith('my-snapshot');
    expect(parseEnvFile).toHaveBeenCalledWith('/tmp/.env');
    expect(mergeEnvVars).toHaveBeenCalledWith({ FOO: 'current', BAR: 'bar' }, { FOO: 'snap' }, 'theirs');
    expect(writeEnvFile).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('my-snapshot'));
  });

  test('handles missing .env gracefully', async () => {
    loadSnapshot.mockResolvedValue({ NEW: 'val' });
    const enoent = new Error('not found');
    enoent.code = 'ENOENT';
    parseEnvFile.mockRejectedValue(enoent);
    mergeEnvVars.mockReturnValue({ merged: { NEW: 'val' }, conflicts: [] });
    formatMergeSummary.mockReturnValue('Merge completed with no conflicts.');
    serializeEnvVars.mockReturnValue('NEW=val\n');
    writeEnvFile.mockResolvedValue();

    await mergeCommand('fresh', { envFile: '/tmp/.env' });

    expect(mergeEnvVars).toHaveBeenCalledWith({}, { NEW: 'val' }, 'theirs');
  });

  test('exits on invalid strategy', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(mergeCommand('snap', { strategy: 'invalid' })).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
