const fs = require('fs');
const { runExport, printExportUsage } = require('./export');
const { exportToFile, exportSnapshot } = require('../export');

jest.mock('fs');
jest.mock('../export');

describe('export command', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('printExportUsage', () => {
    it('should print usage information', () => {
      printExportUsage();
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('snapenv export');
      expect(output).toContain('--format');
      expect(output).toContain('--output');
    });
  });

  describe('runExport', () => {
    it('should show help when -h flag is passed', () => {
      runExport(['-h']);
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('Usage');
    });

    it('should show help when --help flag is passed', () => {
      runExport(['--help']);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should error when no snapshot name provided', () => {
      runExport([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Snapshot name is required');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should export to stdout by default', () => {
      exportSnapshot.mockReturnValue('API_KEY=secret123\nDEBUG=true');
      runExport(['production']);
      expect(exportSnapshot).toHaveBeenCalledWith('production', 'env');
      expect(consoleLogSpy).toHaveBeenCalledWith('API_KEY=secret123\nDEBUG=true');
    });

    it('should export with specified format', () => {
      exportSnapshot.mockReturnValue('{"name":"test"}');
      runExport(['production', '-f', 'json']);
      expect(exportSnapshot).toHaveBeenCalledWith('production', 'json');
    });

    it('should export to file when output specified', () => {
      exportToFile.mockReturnValue({
        snapshot: 'production',
        format: 'env',
        output: '.env.backup',
        size: 128
      });
      runExport(['production', '-o', '.env.backup']);
      expect(exportToFile).toHaveBeenCalledWith('production', '.env.backup', 'env');
    });

    it('should handle both format and output options', () => {
      exportToFile.mockReturnValue({
        snapshot: 'production',
        format: 'json',
        output: 'output.json',
        size: 256
      });
      runExport(['production', '--format', 'json', '--output', 'output.json']);
      expect(exportToFile).toHaveBeenCalledWith('production', 'output.json', 'json');
    });

    it('should handle errors gracefully', () => {
      exportSnapshot.mockImplementation(() => {
        throw new Error('Snapshot not found');
      });
      runExport(['missing']);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Snapshot not found');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
