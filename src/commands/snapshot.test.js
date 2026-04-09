const { runSnapshot } = require('./snapshot');
const { saveSnapshot, listSnapshots, getSnapshotPath } = require('../snapshot');
const { parseEnvFile } = require('../env');
const fs = require('fs');

jest.mock('../snapshot');
jest.mock('../env');
jest.mock('fs');

describe('runSnapshot', () => {
  let consoleSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('save subcommand', () => {
    it('saves a snapshot from default .env file', async () => {
      fs.existsSync.mockReturnValue(true);
      parseEnvFile.mockReturnValue({ FOO: 'bar', BAZ: 'qux' });
      saveSnapshot.mockResolvedValue();

      await runSnapshot(['save', 'mysnap']);

      expect(parseEnvFile).toHaveBeenCalledWith('.env');
      expect(saveSnapshot).toHaveBeenCalledWith('mysnap', { FOO: 'bar', BAZ: 'qux' });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('mysnap'));
    });

    it('saves from custom env file with --env flag', async () => {
      fs.existsSync.mockReturnValue(true);
      parseEnvFile.mockReturnValue({ A: '1' });
      saveSnapshot.mockResolvedValue();

      await runSnapshot(['save', 'staging', '--env', '.env.staging']);

      expect(parseEnvFile).toHaveBeenCalledWith('.env.staging');
    });

    it('exits if env file not found', async () => {
      fs.existsSync.mockReturnValue(false);
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await runSnapshot(['save', 'mysnap']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });
  });

  describe('list subcommand', () => {
    it('lists available snapshots', async () => {
      listSnapshots.mockResolvedValue(['dev', 'staging', 'prod']);

      await runSnapshot(['list']);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('dev'));
    });

    it('shows message when no snapshots exist', async () => {
      listSnapshots.mockResolvedValue([]);

      await runSnapshot(['list']);

      expect(consoleSpy).toHaveBeenCalledWith('No snapshots found.');
    });
  });

  describe('delete subcommand', () => {
    it('deletes an existing snapshot', async () => {
      getSnapshotPath.mockReturnValue('/some/path/mysnap.json');
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockImplementation(() => {});

      await runSnapshot(['delete', 'mysnap']);

      expect(fs.unlinkSync).toHaveBeenCalledWith('/some/path/mysnap.json');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('deleted'));
    });
  });
});
