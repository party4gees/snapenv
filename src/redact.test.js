import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isSensitiveKey, redactEnvVars, formatRedactSummary } from './redact.js';

describe('isSensitiveKey', () => {
  it('matches common secret key names', () => {
    assert.equal(isSensitiveKey('SECRET'), true);
    assert.equal(isSensitiveKey('API_KEY'), true);
    assert.equal(isSensitiveKey('DB_PASSWORD'), true);
    assert.equal(isSensitiveKey('AUTH_TOKEN'), true);
    assert.equal(isSensitiveKey('PRIVATE_KEY'), true);
    assert.equal(isSensitiveKey('AWS_SECRET_ACCESS_KEY'), true);
  });

  it('does not match benign keys', () => {
    assert.equal(isSensitiveKey('NODE_ENV'), false);
    assert.equal(isSensitiveKey('PORT'), false);
    assert.equal(isSensitiveKey('APP_NAME'), false);
    assert.equal(isSensitiveKey('LOG_LEVEL'), false);
  });

  it('is case-insensitive', () => {
    assert.equal(isSensitiveKey('db_password'), true);
    assert.equal(isSensitiveKey('Api_Key'), true);
  });
});

describe('redactEnvVars', () => {
  it('replaces sensitive values with redacted placeholder', () => {
    const vars = { API_KEY: 'abc123', PORT: '3000', DB_PASSWORD: 'hunter2' };
    const result = redactEnvVars(vars);
    assert.equal(result.API_KEY, '[REDACTED]');
    assert.equal(result.DB_PASSWORD, '[REDACTED]');
    assert.equal(result.PORT, '3000');
  });

  it('accepts custom placeholder', () => {
    const vars = { SECRET: 'topsecret', HOST: 'localhost' };
    const result = redactEnvVars(vars, '***');
    assert.equal(result.SECRET, '***');
    assert.equal(result.HOST, 'localhost');
  });

  it('returns empty object for empty input', () => {
    assert.deepEqual(redactEnvVars({}), {});
  });

  it('does not mutate the original object', () => {
    const vars = { API_KEY: 'secret' };
    redactEnvVars(vars);
    assert.equal(vars.API_KEY, 'secret');
  });
});

describe('formatRedactSummary', () => {
  it('lists redacted keys and total count', () => {
    const original = { API_KEY: 'x', PORT: '3000', DB_PASSWORD: 'y' };
    const redacted = redactEnvVars(original);
    const summary = formatRedactSummary(original, redacted);
    assert.ok(summary.includes('2 key(s) redacted'));
    assert.ok(summary.includes('API_KEY'));
    assert.ok(summary.includes('DB_PASSWORD'));
  });

  it('reports zero redactions when none found', () => {
    const vars = { PORT: '3000', HOST: 'localhost' };
    const redacted = redactEnvVars(vars);
    const summary = formatRedactSummary(vars, redacted);
    assert.ok(summary.includes('0 key(s) redacted'));
  });
});
