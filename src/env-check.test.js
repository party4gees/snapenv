const { checkMissingKeys, checkMismatchedValues, envCheck, formatEnvCheckResult } = require('./env-check');

const snapshot = { NODE_ENV: 'production', DB_HOST: 'localhost', DB_PORT: '5432' };
const fullMatch = { NODE_ENV: 'production', DB_HOST: 'localhost', DB_PORT: '5432' };
const partialEnv = { NODE_ENV: 'production' };
const mismatchedEnv = { NODE_ENV: 'development', DB_HOST: 'localhost', DB_PORT: '5432' };

describe('checkMissingKeys', () => {
  test('returns empty array when all keys present', () => {
    expect(checkMissingKeys(snapshot, fullMatch)).toEqual([]);
  });

  test('returns missing keys', () => {
    const missing = checkMissingKeys(snapshot, partialEnv);
    expect(missing).toContain('DB_HOST');
    expect(missing).toContain('DB_PORT');
    expect(missing).not.toContain('NODE_ENV');
  });

  test('returns all keys when env is empty', () => {
    const missing = checkMissingKeys(snapshot, {});
    expect(missing).toHaveLength(3);
  });
});

describe('checkMismatchedValues', () => {
  test('returns empty array when all values match', () => {
    expect(checkMismatchedValues(snapshot, fullMatch)).toEqual([]);
  });

  test('returns mismatched entries', () => {
    const result = checkMismatchedValues(snapshot, mismatchedEnv);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('NODE_ENV');
    expect(result[0].expected).toBe('production');
    expect(result[0].actual).toBe('development');
  });

  test('does not flag missing keys as mismatched', () => {
    const result = checkMismatchedValues(snapshot, partialEnv);
    expect(result).toEqual([]);
  });
});

describe('envCheck', () => {
  test('ok when fully matching', () => {
    const result = envCheck(snapshot, fullMatch);
    expect(result.ok).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.mismatched).toHaveLength(0);
  });

  test('not ok when keys are missing', () => {
    const result = envCheck(snapshot, partialEnv);
    expect(result.ok).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  test('not ok when values mismatch', () => {
    const result = envCheck(snapshot, mismatchedEnv);
    expect(result.ok).toBe(false);
    expect(result.mismatched.length).toBeGreaterThan(0);
  });
});

describe('formatEnvCheckResult', () => {
  test('shows success message when ok', () => {
    const result = envCheck(snapshot, fullMatch);
    const output = formatEnvCheckResult(result, 'my-snap');
    expect(output).toContain('my-snap');
    expect(output).toContain('✓');
  });

  test('shows missing keys', () => {
    const result = envCheck(snapshot, partialEnv);
    const output = formatEnvCheckResult(result, 'my-snap');
    expect(output).toContain('Missing keys');
    expect(output).toContain('DB_HOST');
  });

  test('shows mismatched values', () => {
    const result = envCheck(snapshot, mismatchedEnv);
    const output = formatEnvCheckResult(result, 'my-snap');
    expect(output).toContain('Mismatched values');
    expect(output).toContain('NODE_ENV');
  });
});
