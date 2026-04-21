const { isSensitiveKey, redactEnvVars, formatRedactSummary, REDACT_PLACEHOLDER } = require('./redact');

describe('isSensitiveKey', () => {
  test('matches password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('password')).toBe(true);
  });

  test('matches token keys', () => {
    expect(isSensitiveKey('GITHUB_TOKEN')).toBe(true);
    expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true);
  });

  test('matches api key variants', () => {
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('APIKEY')).toBe(true);
    expect(isSensitiveKey('API-KEY')).toBe(true);
  });

  test('does not match safe keys', () => {
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('APP_NAME')).toBe(false);
  });

  test('respects extra patterns', () => {
    expect(isSensitiveKey('INTERNAL_CODE', [/internal/i])).toBe(true);
  });
});

describe('redactEnvVars', () => {
  const env = {
    NODE_ENV: 'production',
    DB_PASSWORD: 'supersecret',
    API_KEY: 'abc123',
    PORT: '3000',
    SECRET_KEY: 'mysecret',
  };

  test('redacts sensitive keys', () => {
    const { redacted } = redactEnvVars(env);
    expect(redacted.DB_PASSWORD).toBe(REDACT_PLACEHOLDER);
    expect(redacted.API_KEY).toBe(REDACT_PLACEHOLDER);
    expect(redacted.SECRET_KEY).toBe(REDACT_PLACEHOLDER);
  });

  test('preserves safe keys', () => {
    const { redacted } = redactEnvVars(env);
    expect(redacted.NODE_ENV).toBe('production');
    expect(redacted.PORT).toBe('3000');
  });

  test('returns list of redacted keys', () => {
    const { redactedKeys } = redactEnvVars(env);
    expect(redactedKeys).toContain('DB_PASSWORD');
    expect(redactedKeys).toContain('API_KEY');
    expect(redactedKeys).not.toContain('PORT');
  });

  test('supports custom placeholder', () => {
    const { redacted } = redactEnvVars(env, { placeholder: '[HIDDEN]' });
    expect(redacted.DB_PASSWORD).toBe('[HIDDEN]');
  });

  test('supports forced key redaction', () => {
    const { redacted, redactedKeys } = redactEnvVars(env, { keys: ['PORT'] });
    expect(redacted.PORT).toBe(REDACT_PLACEHOLDER);
    expect(redactedKeys).toContain('PORT');
  });
});

describe('formatRedactSummary', () => {
  test('returns message when nothing redacted', () => {
    expect(formatRedactSummary([])).toBe('No sensitive keys detected.');
  });

  test('lists redacted keys', () => {
    const summary = formatRedactSummary(['DB_PASSWORD', 'API_KEY']);
    expect(summary).toContain('2 sensitive key(s)');
    expect(summary).toContain('- DB_PASSWORD');
    expect(summary).toContain('- API_KEY');
  });
});
