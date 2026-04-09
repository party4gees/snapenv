const { diffCommand } = require('./diff');
const { loadSnapshot, listSnapshots } = require('../snapshot');
const { parseEnvFile } = require('../env');
const { diffSnapshotAgainstEnv, formatDiff } = require('../diff');
const fs = require('fs');

jest.mock('../snapshot');
jest.mock('../env');
jest.mock('../diff');
jest.mock('fs');

describe('diffCommand', () => {
  let consoleSpy;
  let consoleErrorSpy;
  let exitSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
    fs.existsSync.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('exits if no snapshots exist', async () => {
    listSnapshots.mockResolvedValue([]);
    await expect(diffCommand('mysnap')).rejects.toThrow('process.exit');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('No snapshots found'));
  });

  it('exits if named snapshot not found', async () => {
    listSnapshots.mockResolvedValue(['other']);
    loadSnapshot.mockRejectedValue(new Error('not found'));
    await expect(diffCommand('mysnap')).rejects.toThrow('process.exit');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  it('exits if env file does not exist', async () => {
    listSnapshots.mockResolvedValue(['mysnap']);
    loadSnapshot.mockResolvedValue({ KEY: 'val' });
    fs.existsSync.mockReturnValue(false);
    await expect(diffCommand('mysnap')).rejects.toThrow('process.exit');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  it('prints no differences message when env matches snapshot', async () => {
    listSnapshots.mockResolvedValue(['mysnap']);
    loadSnapshot.mockResolvedValue({ KEY: 'val' });
    parseEnvFile.mockReturnValue({ KEY: 'val' });
    diffSnapshotAgainstEnv.mockReturnValue([]);
    await diffCommand('mysnap');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No differences'));
  });

  it('prints formatted diff when differences exist', async () => {
    listSnapshots.mockResolvedValue(['mysnap']);
    loadSnapshot.mockResolvedValue({ KEY: 'old' });
    parseEnvFile.mockReturnValue({ KEY: 'new' });
    diffSnapshotAgainstEnv.mockReturnValue([{ key: 'KEY', type: 'changed' }]);
    formatDiff.mockReturnValue('~ KEY: old -> new');
    await diffCommand('mysnap');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('~ KEY: old -> new'));
  });

  it('outputs json when --json option is set', async () => {
    const diffs = [{ key: 'KEY', type: 'changed' }];
    listSnapshots.mockResolvedValue(['mysnap']);
    loadSnapshot.mockResolvedValue({ KEY: 'old' });
    parseEnvFile.mockReturnValue({ KEY: 'new' });
    diffSnapshotAgainstEnv.mockReturnValue(diffs);
    await diffCommand('mysnap', '.env', { json: true });
    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(diffs, null, 2));
  });
});
