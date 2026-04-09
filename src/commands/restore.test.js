const { runRestore } = require('./restore');
const restore = require('../restore');
const snapshot = require('../snapshot');

jest.mock('../restore');
jest.mock('../snapshot');

describe('runRestore command', () => {
  let consoleSpy;
  let errorSpy;
  let exitSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test('exits with error if no snapshot name given', () => {
    snapshot.listSnapshots.mockReturnValue([]);
    expect(() => runRestore(['restore'])).toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('snapshot name is required'));
  });

  test('exits if snapshot does not exist', () => {
    snapshot.listSnapshots.mockReturnValue(['other']);
    expect(() => runRestore(['restore', 'missing'])).toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('does not exist'));
  });

  test('shows available snapshots when restore target missing', () => {
    snapshot.listSnapshots.mockReturnValue(['dev', 'prod']);
    expect(() => runRestore(['restore', 'missing'])).toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('dev'));
  });

  test('calls restoreSnapshot with correct args', () => {
    snapshot.listSnapshots.mockReturnValue(['dev']);
    restore.restoreSnapshot.mockReturnValue({ snapshotName: 'dev', envFilePath: '.env', added: [], removed: [], changed: [], unchanged: [] });
    restore.formatRestoreSummary.mockReturnValue('Restored dev');

    runRestore(['restore', 'dev']);

    expect(restore.restoreSnapshot).toHaveBeenCalledWith('dev', '.env');
    expect(consoleSpy).toHaveBeenCalledWith('Restored dev');
  });

  test('respects --env flag', () => {
    snapshot.listSnapshots.mockReturnValue(['dev']);
    restore.restoreSnapshot.mockReturnValue({ snapshotName: 'dev', envFilePath: '.env.local', added: [], removed: [], changed: [], unchanged: [] });
    restore.formatRestoreSummary.mockReturnValue('ok');

    runRestore(['restore', 'dev', '--env', '.env.local']);

    expect(restore.restoreSnapshot).toHaveBeenCalledWith('dev', '.env.local');
  });

  test('handles restoreSnapshot throwing an error', () => {
    snapshot.listSnapshots.mockReturnValue(['dev']);
    restore.restoreSnapshot.mockImplementation(() => { throw new Error('write failed'); });

    expect(() => runRestore(['restore', 'dev'])).toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('write failed'));
  });
});
