const fs = require('fs');
const path = require('path');
const os = require('os');
const { parseEnvFile, parseEnvString, serializeEnvVars, writeEnvFile } = require('./env');

describe('parseEnvString', () => {
  it('parses basic key=value pairs', () => {
    const result = parseEnvString('FOO=bar\nBAZ=qux\n');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('ignores comment lines', () => {
    const result = parseEnvString('# this is a comment\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('ignores empty lines', () => {
    const result = parseEnvString('\nFOO=bar\n\nBAZ=qux\n');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('strips double quotes from values', () => {
    const result = parseEnvString('FOO="hello world"');
    expect(result).toEqual({ FOO: 'hello world' });
  });

  it('strips single quotes from values', () => {
    const result = parseEnvString("FOO='hello world'");
    expect(result).toEqual({ FOO: 'hello world' });
  });

  it('handles values with equals signs', () => {
    const result = parseEnvString('FOO=bar=baz');
    expect(result).toEqual({ FOO: 'bar=baz' });
  });

  it('handles empty values', () => {
    const result = parseEnvString('FOO=');
    expect(result).toEqual({ FOO: '' });
  });
});

describe('serializeEnvVars', () => {
  it('serializes key-value pairs to .env format', () => {
    const output = serializeEnvVars({ FOO: 'bar', BAZ: 'qux' });
    expect(output).toContain('FOO=bar');
    expect(output).toContain('BAZ=qux');
  });

  it('quotes values with spaces', () => {
    const output = serializeEnvVars({ FOO: 'hello world' });
    expect(output).toContain('FOO="hello world"');
  });

  it('ends with a newline', () => {
    const output = serializeEnvVars({ FOO: 'bar' });
    expect(output.endsWith('\n')).toBe(true);
  });
});

describe('parseEnvFile / writeEnvFile', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapenv-env-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes and reads back env vars correctly', () => {
    const filePath = path.join(tmpDir, '.env');
    const vars = { API_KEY: 'abc123', DEBUG: 'true', APP_NAME: 'my app' };
    writeEnvFile(filePath, vars);
    const result = parseEnvFile(filePath);
    expect(result).toEqual(vars);
  });

  it('throws if file does not exist', () => {
    expect(() => parseEnvFile(path.join(tmpDir, 'missing.env'))).toThrow('File not found');
  });
});
