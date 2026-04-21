const DEFAULT_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /passphrase/i,
];

const REDACT_PLACEHOLDER = '***REDACTED***';

/**
 * Check if a key matches any sensitive pattern
 */
function isSensitiveKey(key, extraPatterns = []) {
  const patterns = [...DEFAULT_PATTERNS, ...extraPatterns];
  return patterns.some((pattern) => pattern.test(key));
}

/**
 * Redact sensitive values from an env vars object
 * Returns a new object with sensitive values replaced
 */
function redactEnvVars(envVars, options = {}) {
  const { extraPatterns = [], placeholder = REDACT_PLACEHOLDER, keys = [] } = options;
  const result = {};
  const redactedKeys = [];

  for (const [key, value] of Object.entries(envVars)) {
    const forcedRedact = keys.includes(key);
    if (forcedRedact || isSensitiveKey(key, extraPatterns)) {
      result[key] = placeholder;
      redactedKeys.push(key);
    } else {
      result[key] = value;
    }
  }

  return { redacted: result, redactedKeys };
}

/**
 * Format a summary of what was redacted
 */
function formatRedactSummary(redactedKeys) {
  if (redactedKeys.length === 0) {
    return 'No sensitive keys detected.';
  }
  const lines = [`Redacted ${redactedKeys.length} sensitive key(s):`, ...redactedKeys.map((k) => `  - ${k}`)];
  return lines.join('\n');
}

module.exports = { isSensitiveKey, redactEnvVars, formatRedactSummary, DEFAULT_PATTERNS, REDACT_PLACEHOLDER };
