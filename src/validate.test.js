const { validateSnapshot, validateSnapshotValues, formatValidationResult } = require('./validate');
const { saveSnapshot } = require('./snapshot');
const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('./snapshot');
jest.mock('./env');

const { parseEnvFile } = require('./env');

describe('validateSnapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns valid when snapshot and env file match', () => {
    require('./snapshot').loadSnapshot.mockReturnValue({ FOO: 'bar', BAZ: 'qux' });
    parseEnvFile.mockReturnValue({ FOO: 'bar', BAZ: 'qux' });
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    const result = validateSnapshot('mysnap', '.env');
    expect(result.valid).toBe(true);
    expect(result.missingFromEnv).toHaveLength(0);
    expect(result.missingFromSnapshot).toHaveLength(0);
  });

  it('detects keys missing from env file', () => {
    require('./snapshot').loadSnapshot.mockReturnValue({ FOO: 'bar', SECRET: 'x' });
    parseEnvFile.mockReturnValue({ FOO: 'bar' });
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    const result = validateSnapshot('mysnap', '.env');
    expect(result.valid).toBe(false);
    expect(result.missingFromEnv).toContain('SECRET');
  });

  it('detects keys missing from snapshot', () => {
    require('./snapshot').loadSnapshot.mockReturnValue({ FOO: 'bar' });
    parseEnvFile.mockReturnValue({ FOO: 'bar', EXTRA: 'val' });
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    const result = validateSnapshot('mysnap', '.env');
    expect(result.valid).toBe(false);
    expect(result.missingFromSnapshot).toContain('EXTRA');
  });

  it('treats missing env file as empty', () => {
    require('./snapshot').loadSnapshot.mockReturnValue({ FOO: 'bar' });
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    const result = validateSnapshot('mysnap', '.env');
    expect(result.missingFromEnv).toContain('FOO');
  });
});

describe('validateSnapshotValues', () => {
  it('finds empty values', () => {
    require('./snapshot').loadSnapshot.mockReturnValue({ FOO: 'ok', BAR: '', BAZ: null });
    const result = validateSnapshotValues('mysnap');
    expect(result.valid).toBe(false);
    expect(result.emptyKeys).toContain('BAR');
    expect(result.emptyKeys).toContain('BAZ');
  });

  it('passes when all values are non-empty', () => {
    require('./snapshot').loadSnapshot.mockReturnValue({ FOO: 'ok', BAR: '1' });
    const result = validateSnapshotValues('mysnap');
    expect(result.valid).toBe(true);
  });
});

describe('formatValidationResult', () => {
  it('shows success message for valid result', () => {
    const out = formatValidationResult({ snapshotName: 'test', valid: true });
    expect(out).toContain('✔');
    expect(out).toContain('test');
  });

  it('shows issues for invalid result', () => {
    const out = formatValidationResult({
      snapshotName: 'test',
      valid: false,
      envFilePath: '.env',
      missingFromEnv: ['SECRET'],
      missingFromSnapshot: [],
    });
    expect(out).toContain('✖');
    expect(out).toContain('SECRET');
  });
});
