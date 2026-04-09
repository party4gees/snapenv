const { runRename, printRenameUsage } = require('./rename');
const rename = require('../rename');

jest.mock('../rename');

describe('runRename', () => {
  let consoleSpy;
  let consoleErrorSpy;
  let exitSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should exit with error if no args provided', async () => {
    await expect(runRename([])).rejects.toThrow('process.exit');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('requires two arguments'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit with error if only one arg provided', async () => {
    await expect(runRename(['only-one'])).rejects.toThrow('process.exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit with error if old and new names are the same', async () => {
    await expect(runRename(['same', 'same'])).rejects.toThrow('process.exit');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('must be different'));
  });

  it('should call renameSnapshot and print summary on success', async () => {
    rename.renameSnapshot.mockResolvedValue({ oldName: 'dev', newName: 'production' });
    rename.buildRenameSummary.mockReturnValue({ oldName: 'dev', newName: 'production' });
    rename.formatRenameSummary.mockReturnValue('Renamed dev -> production');

    await runRename(['dev', 'production']);

    expect(rename.renameSnapshot).toHaveBeenCalledWith('dev', 'production');
    expect(consoleSpy).toHaveBeenCalledWith('Renamed dev -> production');
  });

  it('should handle SNAPSHOT_NOT_FOUND error', async () => {
    const err = new Error('not found');
    err.code = 'SNAPSHOT_NOT_FOUND';
    rename.renameSnapshot.mockRejectedValue(err);

    await expect(runRename(['missing', 'new-name'])).rejects.toThrow('process.exit');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('"missing" not found'));
  });

  it('should handle SNAPSHOT_EXISTS error', async () => {
    const err = new Error('already exists');
    err.code = 'SNAPSHOT_EXISTS';
    rename.renameSnapshot.mockRejectedValue(err);

    await expect(runRename(['old', 'existing'])).rejects.toThrow('process.exit');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('"existing" already exists'));
  });

  it('should trim whitespace from names', async () => {
    rename.renameSnapshot.mockResolvedValue({ oldName: 'dev', newName: 'prod' });
    rename.buildRenameSummary.mockReturnValue({});
    rename.formatRenameSummary.mockReturnValue('done');

    await runRename(['  dev  ', '  prod  ']);
    expect(rename.renameSnapshot).toHaveBeenCalledWith('dev', 'prod');
  });
});
