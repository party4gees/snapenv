const fs = require('fs');
const path = require('path');
const os = require('os');
const { importFromFile, parseJsonFormat, parseShellFormat, parseImportFormat } = require('./import');

describe('import', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('parseJsonFormat', () => {
    test('parses simple JSON object', () => {
      const content = '{"KEY1": "value1", "KEY2": "value2"}';
      const result = parseJsonFormat(content);
      expect(result).toEqual({ KEY1: 'value1', KEY2: 'value2' });
    });

    test('parses JSON with env wrapper', () => {
      const content = '{"env": {"KEY1": "value1", "KEY2": "value2"}}';
      const result = parseJsonFormat(content);
      expect(result).toEqual({ KEY1: 'value1', KEY2: 'value2' });
    });
  });

  describe('parseShellFormat', () => {
    test('parses export statements', () => {
      const content = 'export KEY1=value1\nexport KEY2=value2';
      const result = parseShellFormat(content);
      expect(result).toEqual({ KEY1: 'value1', KEY2: 'value2' });
    });

    test('parses export with quotes', () => {
      const content = 'export KEY1="value with spaces"\nexport KEY2=\'single quotes\'';
      const result = parseShellFormat(content);
      expect(result).toEqual({ KEY1: 'value with spaces', KEY2: 'single quotes' });
    });

    test('ignores non-export lines', () => {
      const content = '# Comment\nexport KEY1=value1\necho "test"\nexport KEY2=value2';
      const result = parseShellFormat(content);
      expect(result).toEqual({ KEY1: 'value1', KEY2: 'value2' });
    });
  });

  describe('parseImportFormat', () => {
    test('routes to correct parser based on format', () => {
      expect(parseImportFormat('KEY=value', 'dotenv')).toEqual({ KEY: 'value' });
      expect(parseImportFormat('{"KEY": "value"}', 'json')).toEqual({ KEY: 'value' });
      expect(parseImportFormat('export KEY=value', 'shell')).toEqual({ KEY: 'value' });
    });
  });

  describe('importFromFile', () => {
    test('imports from .env file', () => {
      const envPath = path.join(tempDir, '.env');
      fs.writeFileSync(envPath, 'KEY1=value1\nKEY2=value2');
      const result = importFromFile(envPath);
      expect(result).toEqual({ KEY1: 'value1', KEY2: 'value2' });
    });

    test('imports from JSON file with auto-detection', () => {
      const jsonPath = path.join(tempDir, 'env.json');
      fs.writeFileSync(jsonPath, '{"KEY1": "value1"}');
      const result = importFromFile(jsonPath, 'auto');
      expect(result).toEqual({ KEY1: 'value1' });
    });

    test('imports from shell file with auto-detection', () => {
      const shPath = path.join(tempDir, 'env.sh');
      fs.writeFileSync(shPath, 'export KEY1=value1');
      const result = importFromFile(shPath, 'auto');
      expect(result).toEqual({ KEY1: 'value1' });
    });

    test('throws error for non-existent file', () => {
      expect(() => importFromFile('/nonexistent/file.env'))
        .toThrow('Source file not found');
    });
  });
});
