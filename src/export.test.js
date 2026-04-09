const fs = require('fs');
const path = require('path');
const { exportSnapshot, exportToDotenv, exportToJson, exportToShell, exportToFile, formatExportSummary } = require('./export');
const { saveSnapshot } = require('./snapshot');

jest.mock('fs');

describe('export', () => {
  const mockSnapshot = {
    name: 'test-snapshot',
    timestamp: '2024-01-15T10:30:00.000Z',
    vars: {
      API_KEY: 'secret123',
      DATABASE_URL: 'postgres://localhost',
      DEBUG: 'true'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockSnapshot));
  });

  describe('exportToDotenv', () => {
    it('should export to .env format', () => {
      const result = exportToDotenv(mockSnapshot);
      expect(result).toContain('API_KEY=secret123');
      expect(result).toContain('DATABASE_URL=postgres://localhost');
      expect(result).toContain('DEBUG=true');
    });
  });

  describe('exportToJson', () => {
    it('should export to JSON format', () => {
      const result = exportToJson(mockSnapshot);
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe('test-snapshot');
      expect(parsed.timestamp).toBe('2024-01-15T10:30:00.000Z');
      expect(parsed.variables.API_KEY).toBe('secret123');
    });
  });

  describe('exportToShell', () => {
    it('should export to shell export format', () => {
      const result = exportToShell(mockSnapshot);
      expect(result).toContain("export API_KEY='secret123'");
      expect(result).toContain("export DATABASE_URL='postgres://localhost'");
      expect(result).toContain("export DEBUG='true'");
    });

    it('should escape single quotes in values', () => {
      const snapshot = {
        vars: { TEST: "it's working" }
      };
      const result = exportToShell(snapshot);
      expect(result).toContain("export TEST='it'\\''s working'");
    });
  });

  describe('exportSnapshot', () => {
    it('should export in env format by default', () => {
      const result = exportSnapshot('test-snapshot');
      expect(result).toContain('API_KEY=secret123');
    });

    it('should export in specified format', () => {
      const result = exportSnapshot('test-snapshot', 'json');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should throw error for non-existent snapshot', () => {
      fs.existsSync.mockReturnValue(false);
      expect(() => exportSnapshot('missing')).toThrow("Snapshot 'missing' not found");
    });
  });

  describe('exportToFile', () => {
    it('should write exported content to file', () => {
      const result = exportToFile('test-snapshot', '/tmp/output.env', 'env');
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(result.snapshot).toBe('test-snapshot');
      expect(result.format).toBe('env');
      expect(result.output).toBe('/tmp/output.env');
    });
  });

  describe('formatExportSummary', () => {
    it('should format export summary', () => {
      const summary = {
        snapshot: 'test-snapshot',
        format: 'json',
        output: '/tmp/output.json',
        size: 256
      };
      const result = formatExportSummary(summary);
      expect(result).toContain('test-snapshot');
      expect(result).toContain('JSON');
      expect(result).toContain('/tmp/output.json');
      expect(result).toContain('256 bytes');
    });
  });
});
