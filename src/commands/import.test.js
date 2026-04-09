const { runImport, printImportUsage } = require('./import');
const { importFromFile } = require('../import');
const fs = require('fs');

jest.mock('../import');
jest.mock('fs');

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('import command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('printImportUsage', () => {
    it('should print usage information', () => {
      printImportUsage();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('snapenv import'));
    });
  });

  describe('runImport', () => {
    it('should import from file to snapshot', async () => {
      const mockResult = {
        snapshotName: 'test-snap',
        count: 5,
        variables: ['VAR1', 'VAR2', 'VAR3', 'VAR4', 'VAR5']
      };
      importFromFile.mockResolvedValue(mockResult);
      fs.existsSync.mockReturnValue(true);

      await runImport(['import', 'env.json', 'test-snap']);

      expect(importFromFile).toHaveBeenCalledWith('env.json', 'test-snap', {});
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Successfully imported'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('5 variables'));
    });

    it('should handle format option', async () => {
      const mockResult = {
        snapshotName: 'test-snap',
        count: 3,
        variables: ['A', 'B', 'C']
      };
      importFromFile.mockResolvedValue(mockResult);
      fs.existsSync.mockReturnValue(true);

      await runImport(['import', 'vars.sh', 'test-snap', '--format', 'shell']);

      expect(importFromFile).toHaveBeenCalledWith('vars.sh', 'test-snap', { format: 'shell' });
    });

    it('should handle merge option', async () => {
      const mockResult = {
        snapshotName: 'existing-snap',
        count: 4,
        variables: ['X', 'Y', 'Z', 'W']
      };
      importFromFile.mockResolvedValue(mockResult);
      fs.existsSync.mockReturnValue(true);

      await runImport(['import', 'data.json', 'existing-snap', '--merge']);

      expect(importFromFile).toHaveBeenCalledWith('data.json', 'existing-snap', { merge: true });
    });

    it('should error if file does not exist', async () => {
      fs.existsSync.mockReturnValue(false);

      await runImport(['import', 'missing.json', 'snap']);

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('File not found'));
      expect(importFromFile).not.toHaveBeenCalled();
    });

    it('should error if snapshot name is missing', async () => {
      await runImport(['import', 'file.json']);

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('snapshot name required'));
    });

    it('should handle import errors', async () => {
      fs.existsSync.mockReturnValue(true);
      importFromFile.mockRejectedValue(new Error('Parse error'));

      await runImport(['import', 'bad.json', 'snap']);

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Failed to import'));
    });
  });
});
